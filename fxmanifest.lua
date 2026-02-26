fx_version 'cerulean'
game 'gta5'

author 'zeke!'
description 'Vehicle Control Panel - Doors, Windows, Engine, Seats, Lights & Signals'
version '1.0.0'

lua54 'yes'

shared_scripts {
    'config.lua',
}

client_scripts {
    'client/main.lua',
}

server_scripts {
    'server/main.lua',
}

ui_page 'html/dist/index.html'

files {
    'html/dist/index.html',
    'html/dist/**/*',
}
