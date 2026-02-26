-- Framework Detection
local Framework = { name = 'standalone' }

local function DetectFramework()
    if Config.Framework ~= 'auto' then
        Framework.name = Config.Framework
    elseif GetResourceState('qbx_core') == 'started' then
        Framework.name = 'qbox'
    elseif GetResourceState('qb-core') == 'started' then
        Framework.name = 'qb'
    elseif GetResourceState('es_extended') == 'started' then
        Framework.name = 'esx'
    end

    if Config.Debug then
        print(('[zeke-vehiclecontrol] Framework detected: %s'):format(Framework.name))
    end
end

-- Key Script Detection
local detectedKeyScript = nil

local function DetectKeyScript()
    if Config.KeyScript ~= 'auto' then
        detectedKeyScript = Config.KeyScript
        if Config.Debug then
            print(('[zeke-vehiclecontrol] Key script (manual): %s'):format(detectedKeyScript))
        end
        return
    end

    local priority = {
        'wasabi_carlock',
        'qs-vehiclekeys',
        'Renewed-Vehiclekeys',
        'vehicles_keys',
        'msk_vehiclekeys',
        'qbx_vehiclekeys',
        'qb-vehiclekeys',
    }

    for _, script in ipairs(priority) do
        if GetResourceState(script) == 'started' then
            detectedKeyScript = script
            if Config.Debug then
                print(('[zeke-vehiclecontrol] Key script (auto-detected): %s'):format(detectedKeyScript))
            end
            return
        end
    end

    if Config.Debug then
        print('[zeke-vehiclecontrol] No key script detected, falling back to framework defaults.')
    end
end

-- Local State
local isNuiOpen = false
local turnSignalThread = nil
local forcedLightsOn = false

local function Debug(...)
    if Config.Debug then
        print('[zeke-vehiclecontrol:client]', ...)
    end
end

local function Notify(msg, type)
    if Config.NotifySystem == 'ox_lib' then
        if GetResourceState('ox_lib') == 'started' then
            exports.ox_lib:notify({ description = msg, type = type or 'info' })
        else
            SetNotificationTextEntry('STRING')
            AddTextComponentString(msg)
            DrawNotification(false, false)
        end
    elseif Config.NotifySystem == 'framework' then
        if Framework.name == 'qbox' or Framework.name == 'qb' then
            TriggerEvent('QBCore:Notify', msg, type or 'primary')
        elseif Framework.name == 'esx' then
            TriggerEvent('esx:showNotification', msg)
        end
    else
        SetNotificationTextEntry('STRING')
        AddTextComponentString(msg)
        DrawNotification(false, false)
    end
end

local function HasVehicleKeys(vehicle)
    if not Config.RequireKeysForEngine then return true end

    local plate = GetVehicleNumberPlateText(vehicle)

    -- Custom check always takes priority
    if Config.CustomKeyCheck then
        local res    = Config.CustomKeyCheck.resource
        local exp    = Config.CustomKeyCheck.export
        local byPlate = Config.CustomKeyCheck.usePlate
        local ok, result = pcall(function()
            return exports[res][exp](byPlate and plate or vehicle)
        end)
        if ok then return result end
        Debug('CustomKeyCheck failed, falling through to detected key script...')
    end

    local script = detectedKeyScript

    -- wasabi_carlock: HasKey(plate) → true/false
    if script == 'wasabi_carlock' then
        local ok, result = pcall(function()
            return exports.wasabi_carlock:HasKey(plate)
        end)
        if ok then return result end

    -- qs-vehiclekeys: GetKey(plate) → true/false
    elseif script == 'qs-vehiclekeys' then
        local ok, result = pcall(function()
            return exports['qs-vehiclekeys']:GetKey(plate)
        end)
        if ok then return result end

    -- Renewed-Vehiclekeys: hasKey(plate) → true/false
    elseif script == 'Renewed-Vehiclekeys' then
        local ok, result = pcall(function()
            return exports['Renewed-Vehiclekeys']:hasKey(plate)
        end)
        if ok then return result end

    -- vehicles_keys (Jaksam): doesPlayerOwnPlate(plate) → true/false
    elseif script == 'vehicles_keys' then
        local ok, result = pcall(function()
            return exports['vehicles_keys']:doesPlayerOwnPlate(plate)
        end)
        if ok then return result end

    -- msk_vehiclekeys: HasPlayerKey(vehicle) → true/false
    elseif script == 'msk_vehiclekeys' then
        local ok, result = pcall(function()
            return exports.msk_vehiclekeys:HasPlayerKey(vehicle)
        end)
        if ok then return result end

    -- qbx_vehiclekeys: HasKeys(vehicle) → true/false
    elseif script == 'qbx_vehiclekeys' then
        local ok, result = pcall(function()
            return exports.qbx_vehiclekeys:HasKeys(vehicle)
        end)
        if ok then return result end

    -- qb-vehiclekeys: HasKeys(vehicle) → true/false
    elseif script == 'qb-vehiclekeys' then
        local ok, result = pcall(function()
            return exports['qb-vehiclekeys']:HasKeys(vehicle)
        end)
        if ok then return result end

    -- No key script detected — fall back to framework-level defaults
    else
        if Framework.name == 'qbox' then
            local ok, result = pcall(function()
                return exports.qbx_vehiclekeys:HasKeys(vehicle)
            end)
            if ok then return result end
        elseif Framework.name == 'qb' then
            local ok, result = pcall(function()
                return exports['qb-vehiclekeys']:HasKeys(vehicle)
            end)
            if ok then return result end
        end
    end

    -- Default: allow engine start if no script answered
    return true
end

local function SendNUI(action, data)
    SendNUIMessage({ action = action, data = data })
end

-- Vehicle Data Collection
local function SendVehicleDataToNui(updateOnly)
    local ped = PlayerPedId()

    if not IsPedInAnyVehicle(ped, false) then
        if not updateOnly then
            Notify(Config.Translation['no_vehicle'], 'error')
        end
        return
    end

    -- Prevent auto-shuffle to driver seat
    SetPedConfigFlag(ped, 184, true)

    local vehicle = GetVehiclePedIsIn(ped, false)
    local model = GetEntityModel(vehicle)
    local seatCount = GetVehicleModelNumberOfSeats(model)
    local maxPassengers = GetVehicleMaxNumberOfPassengers(vehicle) + 1
    local rawDoorCount = GetNumberOfVehicleDoors(vehicle)
    local actualDoorCount = rawDoorCount > 0 and (rawDoorCount - 2) or 0
    local doorCount = maxPassengers > 4 and actualDoorCount or maxPassengers

    local currentSeat = -1
    for i = -1, seatCount - 2 do
        local pedInSeat = GetPedInVehicleSeat(vehicle, i)
        if pedInSeat ~= 0 and pedInSeat == ped then
            currentSeat = i
            break
        end
    end

    local openDoors = {}
    for i = 0, doorCount - 1 do
        if GetVehicleDoorAngleRatio(vehicle, i) > 0.0 then
            openDoors[#openDoors + 1] = i
        end
    end

    if GetVehicleDoorAngleRatio(vehicle, 4) > 0.0 then openDoors[#openDoors + 1] = 4 end
    if GetVehicleDoorAngleRatio(vehicle, 5) > 0.0 then openDoors[#openDoors + 1] = 5 end

    local rolledDownWindows = {}
    for i = 0, doorCount - 1 do
        if not IsVehicleWindowIntact(vehicle, i) then
            rolledDownWindows[#rolledDownWindows + 1] = i
        end
    end

    local indicatorState = GetVehicleIndicatorLights(vehicle)
    local _retval, _lightsOn, highBeamsOn = GetVehicleLightsState(vehicle)
    local lightsOn = forcedLightsOn and 1 or _lightsOn

    SendNUI('vehicleData', {
        doors = doorCount,
        seats = seatCount,
        currentSeat = currentSeat,
        engineOn = GetIsVehicleEngineRunning(vehicle),
        indicatorLights = indicatorState,
        openDoors = openDoors,
        rolledDownWindows = rolledDownWindows,
        interiorLight = IsVehicleInteriorLightOn(vehicle),
        headlights = lightsOn == 1,
        highBeams = highBeamsOn == 1,
        hasHood = rawDoorCount > 4,
        hasTrunk = rawDoorCount > 5,
    })

    SendNUI('config', {
        features = Config.Features,
        translation = Config.Translation,
    })

    if not updateOnly then
        isNuiOpen = true
        SetNuiFocus(true, true)
        SendNUI('setVisible', true)
    end
end

local function CloseNui()
    if not isNuiOpen then return end
    isNuiOpen = false
    SetNuiFocus(false, false)
    SendNUI('setVisible', false)
end

-- NUI açıkken araç verisini periyodik olarak günceller
local function StartStatePolling()
    CreateThread(function()
        while isNuiOpen do
            local ped = PlayerPedId()
            if not IsPedInAnyVehicle(ped, false) then
                CloseNui()
                break
            end

            local vehicle = GetVehiclePedIsIn(ped, false)
            if not DoesEntityExist(vehicle) or IsEntityDead(vehicle) then
                CloseNui()
                break
            end

            SendVehicleDataToNui(true)
            Wait(500)
        end
    end)
end

-- NUI Callbacks
RegisterNuiCallback('hideFrame', function(_, cb)
    cb(1)
    CloseNui()
end)

RegisterNuiCallback('toggleDoor', function(data, cb)
    cb(1)
    local ped = PlayerPedId()
    if not IsPedInAnyVehicle(ped, false) then return end

    local vehicle = GetVehiclePedIsIn(ped, false)
    local doorIndex = tonumber(data.doorIndex)
    if not doorIndex then return end

    if GetVehicleDoorAngleRatio(vehicle, doorIndex) > 0.0 then
        SetVehicleDoorShut(vehicle, doorIndex, false)
    else
        SetVehicleDoorOpen(vehicle, doorIndex, false, false)
    end

    SetTimeout(500, function() SendVehicleDataToNui(true) end)
end)

RegisterNuiCallback('toggleWindow', function(data, cb)
    cb(1)
    local ped = PlayerPedId()
    if not IsPedInAnyVehicle(ped, false) then return end

    local vehicle = GetVehiclePedIsIn(ped, false)
    local windowIndex = tonumber(data.windowIndex)
    if not windowIndex then return end

    if IsVehicleWindowIntact(vehicle, windowIndex) then
        RollDownWindow(vehicle, windowIndex)
    else
        RollUpWindow(vehicle, windowIndex)
    end

    SetTimeout(300, function() SendVehicleDataToNui(true) end)
end)

RegisterNuiCallback('switchSeat', function(data, cb)
    cb(1)
    local ped = PlayerPedId()
    if not IsPedInAnyVehicle(ped, false) then return end

    local vehicle = GetVehiclePedIsIn(ped, false)
    local seatIndex = tonumber(data.seatIndex)
    if not seatIndex then return end

    -- NUI 1-based -> FiveM seat index (-1 = driver, 0 = passenger...)
    local fivemSeatIndex = seatIndex - 1

    if not IsVehicleSeatFree(vehicle, fivemSeatIndex) then
        Notify(Config.Translation['seat_occupied'], 'error')
        return
    end

    SetPedIntoVehicle(ped, vehicle, fivemSeatIndex)
    SetTimeout(300, function() SendVehicleDataToNui(true) end)
end)

RegisterNuiCallback('toggleEngine', function(_, cb)
    cb(1)
    local ped = PlayerPedId()
    if not IsPedInAnyVehicle(ped, false) then return end

    local vehicle = GetVehiclePedIsIn(ped, false)
    local engineRunning = GetIsVehicleEngineRunning(vehicle)

    if not engineRunning and not HasVehicleKeys(vehicle) then
        Notify(Config.Translation['no_keys'], 'error')
        return
    end

    SetVehicleEngineOn(vehicle, not engineRunning, false, true)
    SetTimeout(1000, function() SendVehicleDataToNui(true) end)
end)

RegisterNuiCallback('toggleHazards', function(_, cb)
    cb(1)
    local ped = PlayerPedId()
    if not IsPedInAnyVehicle(ped, false) then return end

    local vehicle = GetVehiclePedIsIn(ped, false)
    local lightsState = GetVehicleIndicatorLights(vehicle)

    if lightsState ~= 3 then
        SetVehicleIndicatorLights(vehicle, 0, true)
        SetVehicleIndicatorLights(vehicle, 1, true)
    else
        SetVehicleIndicatorLights(vehicle, 0, false)
        SetVehicleIndicatorLights(vehicle, 1, false)
    end

    SetTimeout(100, function() SendVehicleDataToNui(true) end)
end)

RegisterNuiCallback('toggleLeftSignal', function(_, cb)
    cb(1)
    local ped = PlayerPedId()
    if not IsPedInAnyVehicle(ped, false) then return end

    local vehicle = GetVehiclePedIsIn(ped, false)
    local lightsState = GetVehicleIndicatorLights(vehicle)
    local leftOn = lightsState == 1 or lightsState == 3

    SetVehicleIndicatorLights(vehicle, 0, false)
    SetVehicleIndicatorLights(vehicle, 1, not leftOn)

    -- Auto-cancel
    if not leftOn and Config.TurnSignalAutoCancelMs > 0 then
        if turnSignalThread then turnSignalThread = nil end
        local threadId = GetGameTimer()
        turnSignalThread = threadId
        SetTimeout(Config.TurnSignalAutoCancelMs, function()
            if turnSignalThread == threadId then
                local v = GetVehiclePedIsIn(PlayerPedId(), false)
                if v ~= 0 then
                    SetVehicleIndicatorLights(v, 1, false)
                    SendVehicleDataToNui(true)
                end
                turnSignalThread = nil
            end
        end)
    end

    SetTimeout(100, function() SendVehicleDataToNui(true) end)
end)

RegisterNuiCallback('toggleRightSignal', function(_, cb)
    cb(1)
    local ped = PlayerPedId()
    if not IsPedInAnyVehicle(ped, false) then return end

    local vehicle = GetVehiclePedIsIn(ped, false)
    local lightsState = GetVehicleIndicatorLights(vehicle)
    local rightOn = lightsState == 2 or lightsState == 3

    SetVehicleIndicatorLights(vehicle, 1, false)
    SetVehicleIndicatorLights(vehicle, 0, not rightOn)

    -- Auto-cancel
    if not rightOn and Config.TurnSignalAutoCancelMs > 0 then
        if turnSignalThread then turnSignalThread = nil end
        local threadId = GetGameTimer()
        turnSignalThread = threadId
        SetTimeout(Config.TurnSignalAutoCancelMs, function()
            if turnSignalThread == threadId then
                local v = GetVehiclePedIsIn(PlayerPedId(), false)
                if v ~= 0 then
                    SetVehicleIndicatorLights(v, 0, false)
                    SendVehicleDataToNui(true)
                end
                turnSignalThread = nil
            end
        end)
    end

    SetTimeout(100, function() SendVehicleDataToNui(true) end)
end)

RegisterNuiCallback('toggleHeadlights', function(_, cb)
    cb(1)
    local ped = PlayerPedId()
    if not IsPedInAnyVehicle(ped, false) then return end

    local vehicle = GetVehiclePedIsIn(ped, false)

    if forcedLightsOn then
        SetVehicleLights(vehicle, 1)
        forcedLightsOn = false
    else
        SetVehicleLights(vehicle, 2)
        forcedLightsOn = true
    end

    SetTimeout(100, function() SendVehicleDataToNui(true) end)
end)

RegisterNuiCallback('toggleInteriorLight', function(_, cb)
    cb(1)
    local ped = PlayerPedId()
    if not IsPedInAnyVehicle(ped, false) then return end

    local vehicle = GetVehiclePedIsIn(ped, false)
    local newState = not IsVehicleInteriorLightOn(vehicle)

    SetVehicleInteriorlight(vehicle, newState)

    -- StateBag sync
    local netId = VehToNet(vehicle)
    if netId and netId ~= 0 then
        TriggerServerEvent('zeke-vehiclecontrol:server:int_light', netId, newState)
    end

    SetTimeout(200, function() SendVehicleDataToNui(true) end)
end)

-- StateBag handler
AddStateBagChangeHandler('int_light', nil, function(bagName, key, value)
    local entity = GetEntityFromStateBagName(bagName)
    if entity == 0 then return end
    SetVehicleInteriorlight(entity, value)
end)

-- Commands & Keybinds
RegisterCommand(Config.CommandName, function()
    if isNuiOpen then
        CloseNui()
        return
    end

    local ped = PlayerPedId()
    if not IsPedInAnyVehicle(ped, false) then
        Notify(Config.Translation['no_vehicle'], 'error')
        return
    end

    local vehicle = GetVehiclePedIsIn(ped, false)
    local _retval, _lightsOn = GetVehicleLightsState(vehicle)
    forcedLightsOn = _lightsOn == 1

    SendVehicleDataToNui()
    StartStatePolling()
end, false)

if Config.Keybind.enabled then
    RegisterKeyMapping(Config.CommandName, 'Open Vehicle Control Panel', 'keyboard', Config.Keybind.key)
end

-- closenui with esc
CreateThread(function()
    while true do
        Wait(0)
        if isNuiOpen then
            DisableControlAction(0, 200, true)
            if IsDisabledControlJustReleased(0, 200) then
                CloseNui()
            end
        else
            Wait(200)
        end
    end
end)

-- Init
CreateThread(function()
    DetectFramework()
    DetectKeyScript()
end)

AddEventHandler('onResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then return end
    if isNuiOpen then CloseNui() end
end)
