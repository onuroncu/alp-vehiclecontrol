--[[
    zeke-vehiclecontrol Configuration
]]

Config = {}

-- Framework Detection
-- 'auto' = automatically detect framework (qbox, qb, esx)
-- Or manually set: 'qbox', 'qb', 'esx'
Config.Framework = 'auto'

-- Debug Mode
Config.Debug = false


-- Command & Keybind
Config.CommandName = 'vehcontrol'   -- Chat command to open the vehicle control menu

Config.Keybind = {
    enabled = true,                 -- Enable keybind mapping
    key = 'Y',                      -- Default key to open the menu
}

-- Features Toggle
Config.Features = {
    doors = true,                   -- Enable door control
    windows = true,                 -- Enable window control
    engine = true,                  -- Enable engine control
    seats = true,                   -- Enable seat switching
    hazardLights = true,            -- Enable hazard lights toggle
    turnSignals = true,             -- Enable left/right turn signals
    headlights = true,              -- Enable headlights toggle
    interiorLight = true,           -- Enable interior light toggle
}

-- Turn Signal Auto-Cancel
-- Automatically turn off turn signals after a set time (in milliseconds)
-- Set to 0 to disable auto-cancel
Config.TurnSignalAutoCancelMs = 10000

-- Vehicle Keys Check
-- If true, the script will check if the player has keys before starting the engine.
Config.RequireKeysForEngine = true

-- Which key script to use for the engine start check.
-- 'auto'                = Auto-detect from running resources (recommended)
-- 'wasabi_carlock'      = Wasabi Car Lock         | exports.wasabi_carlock:HasKey(plate)
-- 'qs-vehiclekeys'      = Quasar Vehicle Keys     | exports['qs-vehiclekeys']:GetKey(plate)
-- 'Renewed-Vehiclekeys' = Renewed Vehicle Keys    | exports['Renewed-Vehiclekeys']:hasKey(plate)
-- 'vehicles_keys'       = Jaksam Vehicles Keys    | exports['vehicles_keys']:doesPlayerOwnPlate(plate)
-- 'msk_vehiclekeys'     = MSK Vehicle Keys        | exports.msk_vehiclekeys:HasPlayerKey(vehicle)
-- 'qbx_vehiclekeys'     = QBox Vehicle Keys       | exports.qbx_vehiclekeys:HasKeys(vehicle)
-- 'qb-vehiclekeys'      = QBCore Vehicle Keys     | exports['qb-vehiclekeys']:HasKeys(vehicle)
Config.KeyScript = 'auto'

-- Custom key check export (optional) — takes priority over KeyScript when set.
-- usePlate = true  → export receives the license plate string
-- usePlate = false → export receives the vehicle entity handle
-- Example: Config.CustomKeyCheck = { resource = 'my_keys', export = 'HasKey', usePlate = true }
Config.CustomKeyCheck = nil

-- Notification System
-- 'ox_lib'    = Use ox_lib notifications (recommended)
-- 'framework' = Use framework-native notifications (QBCore.Functions.Notify / ESX.ShowNotification)
-- 'native'    = Use basic GTA notifications
Config.NotifySystem = 'ox_lib'

-- UI Labels / Translation
Config.Translation = {
    ['menu_title']        = 'Vehicle Control',
    ['tab_doors']         = 'Doors',
    ['tab_windows']       = 'Windows',
    ['tab_seats']         = 'Seats',
    ['tab_lights']        = 'Lights',
    ['tab_engine']        = 'Engine',
    ['door_prefix']       = 'Door',
    ['door_hood']         = 'Hood',
    ['door_trunk']        = 'Trunk',
    ['window_prefix']     = 'Window',
    ['seat_driver']       = 'Driver',
    ['seat_passenger']    = 'Passenger',
    ['seat_rear']         = 'Rear',
    ['engine_on']         = 'Engine ON',
    ['engine_off']        = 'Engine OFF',
    ['hazards']           = 'Hazard Lights',
    ['left_signal']       = 'Left Signal',
    ['right_signal']      = 'Right Signal',
    ['headlights']        = 'Lights',
    ['interior_light']    = 'Interior Light',
    ['open']              = 'Open',
    ['closed']            = 'Closed',
    ['up']                = 'Up',
    ['down']              = 'Down',
    ['on']                = 'ON',
    ['off']               = 'OFF',
    ['no_vehicle']        = 'You must be in a vehicle.',
    ['no_keys']           = 'You don\'t have keys for this vehicle.',
    ['seat_occupied']     = 'That seat is occupied.',
    ['tip_right_click']   = 'Right-click for cursor mode',
}
