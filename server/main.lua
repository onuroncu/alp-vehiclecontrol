-- Framework Detection
local Framework = { name = 'standalone', obj = nil }

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

    if Framework.name == 'qbox' or Framework.name == 'qb' then
        Framework.obj = exports['qb-core']:GetCoreObject()
    elseif Framework.name == 'esx' then
        Framework.obj = exports['es_extended']:getSharedObject()
    end

    print(('[zeke-vehiclecontrol] Server framework detected: %s'):format(Framework.name))
end

-- Helpers
local function GetPlayerIdentifier(source)
    if Framework.name == 'qbox' then
        local player = exports.qbx_core:GetPlayer(source)
        return player and player.PlayerData.citizenid
    elseif Framework.name == 'qb' and Framework.obj then
        local player = Framework.obj.Functions.GetPlayer(source)
        return player and player.PlayerData.citizenid
    elseif Framework.name == 'esx' and Framework.obj then
        local xPlayer = Framework.obj.GetPlayerFromId(source)
        return xPlayer and xPlayer.identifier
    end
    return nil
end

local function GetPlayerName(source)
    if Framework.name == 'qbox' then
        local player = exports.qbx_core:GetPlayer(source)
        if player then
            return ('%s %s'):format(player.PlayerData.charinfo.firstname, player.PlayerData.charinfo.lastname)
        end
    elseif Framework.name == 'qb' and Framework.obj then
        local player = Framework.obj.Functions.GetPlayer(source)
        if player then
            return ('%s %s'):format(player.PlayerData.charinfo.firstname, player.PlayerData.charinfo.lastname)
        end
    elseif Framework.name == 'esx' and Framework.obj then
        local xPlayer = Framework.obj.GetPlayerFromId(source)
        if xPlayer then return xPlayer.getName() end
    end
    return GetPlayerName(source) or 'Unknown'
end

-- Server Events
RegisterNetEvent('zeke-vehiclecontrol:server:syncIndicators', function(netId, indicatorState)
    local source = source
    if not source or source <= 0 then return end
    TriggerClientEvent('zeke-vehiclecontrol:client:syncIndicators', -1, netId, indicatorState, source)
end)

RegisterNetEvent('zeke-vehiclecontrol:server:syncHeadlights', function(netId, lightsState)
    local source = source
    if not source or source <= 0 then return end
    TriggerClientEvent('zeke-vehiclecontrol:client:syncHeadlights', -1, netId, lightsState, source)
end)

-- Interior Light StateBag sync
RegisterNetEvent('zeke-vehiclecontrol:server:int_light', function(id, value)
    local veh = NetworkGetEntityFromNetworkId(id)
    Entity(veh).state.int_light = value
end)

-- Logging
local function LogAction(source, action, details)
    if not Config.Debug then return end
    local identifier = GetPlayerIdentifier(source) or 'unknown'
    print(('[zeke-vehiclecontrol] [%s] Player %d (%s): %s %s'):format(
        os.date('%H:%M:%S'), source, identifier, action, details or ''
    ))
end

-- Init
CreateThread(function()
    DetectFramework()
end)

exports('GetFramework', function()
    return Framework.name
end)

print('[zeke-vehiclecontrol] Server loaded.')
