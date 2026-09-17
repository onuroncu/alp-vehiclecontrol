<div align="center">

# 🚗 alp-vehiclecontrol

**Advanced Vehicle Control Panel for FiveM**

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![FiveM](https://img.shields.io/badge/FiveM-Compatible-green?style=for-the-badge)
![Lua](https://img.shields.io/badge/Lua-5.4-purple?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge)

</div>

---

## 📖 About

**alp-vehiclecontrol** is a comprehensive vehicle control panel built for FiveM servers. It features a modern, minimal NUI interface that allows players to easily manage their vehicle's doors, windows, engine, seats, and lights — all from a single sleek toolbar.

![Preview Compact](https://i.imgur.com/H3rXE7g.png)
![Preview Default](https://i.imgur.com/S8F733j.png)

---

## ✨ Features

### 🚪 Door Control
- Open and close each door individually
- Hood and trunk support
- Real-time status indicator (open / closed)

### 🪟 Window Control
- Roll down or roll up each window independently
- Separate control for every window

### 💡 Light Control
- **Headlights:** Toggle vehicle headlights on/off
- **Hazard Lights:** Toggle hazard lights — animated pulse icon while active
- **Left Turn Signal:** Toggle left indicator
- **Right Turn Signal:** Toggle right indicator
- **Interior Light:** Toggle cabin light — synced to all players via StateBag
- **Auto-Cancel Signals:** Turn signals automatically turn off after a configurable delay

### ⚙️ Engine Control
- Start or stop the vehicle engine
- Vehicle key validation (integrated with supported frameworks)

### 💺 Seat Switching
- Switch between all available seats in the vehicle
- Warns the player if the target seat is already occupied
- Supports driver, passenger, and rear seats

---

## 🖥️ UI

A modern, lightweight toolbar anchored to the bottom of the screen.

- **Compact Mode:** Icon-only buttons with tooltips on hover — clean and minimal
- **Default Mode:** Icons with inline text labels — easy to read at a glance
- Mode switching is instant and animated
- Close the menu with `ESC` or the close (✕) button

> The UI is built with **React 18**, **Tailwind CSS**, **Radix UI**, and **Lucide Icons**.

---

## 📦 Requirements

| Dependency | Required | Description |
|---|---|---|
| [ox_lib](https://github.com/overextended/ox_lib) | Recommended | Notification system |
| [qbx_core](https://github.com/qbox-project/qbx_core) | Optional | QBox framework |
| [qb-core](https://github.com/qbcore-framework/qb-core) | Optional | QBCore framework |
| [es_extended](https://github.com/esx-framework/esx_core) | Optional | ESX framework |

**Key Scripts** — one of the following (auto-detected):

| Key Script | Description |
|---|---|
| [wasabi_carlock](https://docs.wasabiscripts.com/wasabi-scripts/advanced-series/wasabi_carlock) | Wasabi Car Lock |
| [qs-vehiclekeys](https://docs.quasar-store.com/scripts/vehiclekeys) | Quasar Vehicle Keys |
| [Renewed-Vehiclekeys](https://renewed.dev/key/exports) | Renewed Vehicle Keys |
| [vehicles_keys](https://documentation.jaksam-scripts.com/vehicles-keys) | Jaksam Vehicles Keys |
| [msk_vehiclekeys](https://docu.msk-scripts.de/scripts/msk-vehiclekeys) | MSK Vehicle Keys |
| [qbx_vehiclekeys](https://github.com/qbox-project/qbx_vehiclekeys) | QBox Vehicle Keys |
| [qb-vehiclekeys](https://github.com/qbcore-framework/qb-vehiclekeys) | QBCore Vehicle Keys |

> ⚠️ Works without any framework or key script in standalone mode.

---

## 🛠️ Installation

### 1. Download the Files
```sh
# Clone the repository or download as ZIP
git clone https://github.com/yourname/zeke-vehiclecontrol.git
```

### 2. Add to Your Server
```
resources/
└── zeke-vehiclecontrol/   ← Place this folder here
```

### 3. Add to `server.cfg`
```cfg
ensure zeke-vehiclecontrol
```

### 4. (Optional) Build the UI Yourself
```sh
cd html
pnpm install    # or: npm install
pnpm build      # or: npm run build
```

> The `html/dist/` folder is already pre-built and ready to use. Rebuilding is not required.

---

## ⚙️ Configuration

All settings are managed from the `config.lua` file.

### Framework
```lua
Config.Framework = 'auto'
-- 'auto'  → Auto-detect the active framework (qbox, qb, esx)
-- 'qbox'  → QBox Core
-- 'qb'    → QBCore
-- 'esx'   → ESX
```

### Command & Keybind
```lua
Config.CommandName = 'vehcontrol'   -- Open the menu with /vehcontrol

Config.Keybind = {
    enabled = true,     -- Enable key mapping
    key = 'Y',          -- Default key
}
```

### Toggle Features
```lua
Config.Features = {
    doors         = true,   -- Door control
    windows       = true,   -- Window control
    engine        = true,   -- Engine control
    seats         = true,   -- Seat switching
    hazardLights  = true,   -- Hazard lights
    turnSignals   = true,   -- Turn signals
    headlights    = true,   -- Headlights
    interiorLight = true,   -- Interior light
}
```

### Turn Signal Auto-Cancel
```lua
Config.TurnSignalAutoCancelMs = 10000   -- Signal turns off after 10 seconds
-- 0 = auto-cancel disabled
```

### Vehicle Key Check
```lua
Config.RequireKeysForEngine = true  -- Require keys to start the engine?

-- Which key script to use for the engine start check.
-- 'auto'                = Auto-detect from running resources (recommended)
-- 'wasabi_carlock'      = Wasabi Car Lock
-- 'qs-vehiclekeys'      = Quasar Vehicle Keys
-- 'Renewed-Vehiclekeys' = Renewed Vehicle Keys
-- 'vehicles_keys'       = Jaksam Vehicles Keys
-- 'msk_vehiclekeys'     = MSK Vehicle Keys
-- 'qbx_vehiclekeys'     = QBox Vehicle Keys
-- 'qb-vehiclekeys'      = QBCore Vehicle Keys
Config.KeyScript = 'auto'

-- Custom key check export (optional) — takes priority over KeyScript when set.
-- usePlate = true  → export receives the license plate string
-- usePlate = false → export receives the vehicle entity handle
Config.CustomKeyCheck = nil
-- Example: { resource = 'my_keys', export = 'HasKey', usePlate = true }
```

#### Auto-Detection Priority

When `Config.KeyScript = 'auto'`, the script checks running resources in this order:

| Priority | Script | Export Used |
|---|---|---|
| 1 | `wasabi_carlock` | `HasKey(plate)` |
| 2 | `qs-vehiclekeys` | `GetKey(plate)` |
| 3 | `Renewed-Vehiclekeys` | `hasKey(plate)` |
| 4 | `vehicles_keys` | `doesPlayerOwnPlate(plate)` |
| 5 | `msk_vehiclekeys` | `HasPlayerKey(vehicle)` |
| 6 | `qbx_vehiclekeys` | `HasKeys(vehicle)` |
| 7 | `qb-vehiclekeys` | `HasKeys(vehicle)` |

> If none are found, the script falls back to the active framework's default key resource. If no framework is present, engine start is always allowed.

### Notification System
```lua
Config.NotifySystem = 'ox_lib'
-- 'ox_lib'    → ox_lib notifications (recommended)
-- 'framework' → Framework-native notifications
-- 'native'    → GTA built-in notifications
```

### Translation / Language Support
```lua
Config.Translation = {
    ['menu_title']   = 'Vehicle Control',
    ['tab_doors']    = 'Doors',
    ['no_vehicle']   = 'You must be in a vehicle.',
    ['no_keys']      = "You don't have keys for this vehicle.",
    -- ... and more
}
```

---

## 🎮 Usage

| Method | Description |
|---|---|
| `Y` key | Open / close the menu (default) |
| `/vehcontrol` | Open / close via chat command |
| `ESC` | Close the menu |
| Close (✕) button | Close the menu |

> The keybind can be rebound by the player in their FiveM key settings.

---

## 🔧 Framework Support

| Framework | Status |
|---|---|
| **QBox (qbx_core)** | ✅ Fully supported |
| **QBCore (qb-core)** | ✅ Fully supported |
| **ESX (es_extended)** | ✅ Fully supported |
| **Standalone** | ✅ Supported (no key checks) |

The framework is detected automatically at startup when `Config.Framework` is set to `'auto'`.

---

## 🔗 Exports

```lua
-- Server-side usage
local framework = exports['zeke-vehiclecontrol']:GetFramework()
-- Returns: 'qbox' | 'qb' | 'esx' | 'standalone'
```

---

## 🗂️ File Structure

```
zeke-vehiclecontrol/
├── client/
│   └── main.lua          # Client logic, NUI callbacks
├── server/
│   └── main.lua          # Server sync, framework integration
├── html/
│   ├── src/
│   │   ├── App.jsx       # Main React component
│   │   ├── main.jsx      # Entry point
│   │   └── components/   # UI components
│   ├── dist/             # Pre-built files (ready to use)
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── config.lua            # All configuration settings
├── fxmanifest.lua        # FiveM manifest file
└── readme.md
```

---

## 🐛 Debug Mode

```lua
Config.Debug = true   -- Prints detailed log messages to the console
```

When debug is enabled, the following is logged to the console:
- Detected framework name
- Player action logs (identifier, action, timestamp)

---

## 🤝 Contributing

Pull requests and issues are always welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 📝 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

<div align="center">

Made with ❤️ by **zeke!**

</div>
