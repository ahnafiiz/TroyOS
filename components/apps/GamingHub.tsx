import { useState, useRef, useEffect } from 'react'

const TROXY_BASE = "https://troy-os-troxy.vercel.app"

const G_DATA = [
  { id: '117', n: "Cyberpunk 2077", dev: "CD PROJEKT RED", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=117&name=Cyberpunk%202077", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/library_hero.jpg", tags: ["Cyberpunk", "Open World", "RPG", "Sci-fi"] },
  { id: '209', n: "Grand Theft Auto V", dev: "Rockstar North", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=209", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/library_hero.jpg", tags: ["Open World", "Action", "Multiplayer", "Crime"] },
  { id: '598', n: "Elden Ring", dev: "FromSoftware Inc.", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=598", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_hero.jpg", tags: ["Souls-like", "Dark Fantasy", "RPG", "Difficult"] },
  { id: '1014', n: "Sim Racing Telemetry - F1 22", dev: "Codemasters", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1014", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1692250/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1692250/library_hero.jpg", tags: ["Racing", "Simulation", "Sports", "Formula 1"] },
  { id: '1021', n: "Little Nightmares III", dev: "Supermassive Games", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1021", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2136470/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2136470/library_hero.jpg", tags: ["Horror", "Puzzle", "Adventure", "Atmospheric"] },
  { id: '963', n: "God of War: Ragnarök", dev: "Santa Monica Studio", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=963", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2322010/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2322010/library_hero.jpg", tags: ["Action", "Adventure", "RPG", "Mythology"] },
  { id: '587', n: "God of War 4", dev: "Santa Monica Studio", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=587", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1593500/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1593500/library_hero.jpg", tags: ["Action", "Adventure", "RPG", "Mythology"] },
  { id: '765', n: "The Last of Us Part I", dev: "Naughty Dog", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=765", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1888930/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1888930/library_hero.jpg", tags: ["Action", "Adventure", "Story Rich", "Survival"] },
  { id: '697', n: "Hogwarts Legacy", dev: "Avalanche Software", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=697", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/990080/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/990080/library_hero.jpg", tags: ["RPG", "Open World", "Magic", "Adventure"] },
  { id: '625', n: "Marvel's Spider-Man Remastered", dev: "Insomniac Games", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=625", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817070/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817070/library_hero.jpg", tags: ["Action", "Open World", "Superhero", "Adventure"] },
  { id: '445', n: "Forza Horizon 4", dev: "Playground Games", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=445", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1293830/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1293830/library_hero.jpg", tags: ["Racing", "Open World", "Cars", "Simulation"] },
  { id: '1003', n: "JDM: Japanese Drift Master", dev: "Gaming Factory", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1003", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1153410/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1153410/library_hero.jpg", tags: ["Racing", "Drifting", "Automobile", "Simulation"] },
  { id: '723', n: "Need for Speed: Payback", dev: "Ghost Games", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=723", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1222680/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1222680/library_hero.jpg", tags: ["Racing", "Action", "Driving", "Open World"] },
  { id: '676', n: "Drift Racing Online", dev: "CarX Technologies", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=676", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/635260/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/635260/library_hero.jpg", tags: ["Racing", "Simulation", "Drifting", "Multiplayer"] },
  { id: '975', n: "Poppy Playtime: Chapter 4", dev: "Mob Entertainment", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=975", img: "https://cdn1.epicgames.com/spt-assets/465c0f6c95d04b1c86b280b4925fee2d/poppy-playtime-1g4f9.jpg", bg: "https://assets.nintendo.com/image/upload/q_auto/f_auto/store/software/switch/70010000085884/e4a283c588469fa52f058b0695b2c9ead24ed1f484e8f08ee29337210e7ef976", tags: ["Horror", "Puzzle", "Indie", "Adventure"] },
  { id: '958', n: "Poppy Playtime: Chapter 3", dev: "Mob Entertainment", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=958", img: "https://cdn.displate.com/artwork/857x1200/2026-01-29/51bf7d02-f692-4d5a-bb6d-6b8b01295343.jpg", bg: "https://assets.nintendo.com/image/upload/q_auto/f_auto/store/software/switch/70010000080061/84d905b10cdc77d6c0e034b2047c0cadbd58c7dd5c6b3661057ea71b225aad20", tags: ["Horror", "Puzzle", "Indie"] },
  { id: '966', n: "Poppy Playtime: Chapter 2", dev: "Mob Entertainment", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=966", img: "https://cdn1.epicgames.com/spt-assets/465c0f6c95d04b1c86b280b4925fee2d/poppy-playtime-1g3iv.png", bg: "https://cdn1.epicgames.com/spt-assets/465c0f6c95d04b1c86b280b4925fee2d/poppy-playtime-75nij.png", tags: ["Horror", "Puzzle", "Indie"] },
  { id: '965', n: "Poppy Playtime: Chapter 1", dev: "Mob Entertainment", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=965", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1721470/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1721470/library_hero.jpg", tags: ["Horror", "Puzzle", "Indie"] },
  { id: '980', n: "Platform 8", dev: "Chilla's Art", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=980", img: "https://playism.com/wp-content/uploads/2024/11/06_8th_Logo_Keyart-1024x576.jpg", bg: "https://playism.com/wp-content/uploads/2024/11/06_8th_Logo_Keyart-1024x576.jpg", tags: ["Horror", "Walking Sim", "Indie", "Atmospheric"] },
  { id: '669', n: "Choo-Choo Charles", dev: "Two Star Games", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=669", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1766740/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1766740/library_hero.jpg", tags: ["Horror", "Survival", "Action", "Indie"] },
  { id: '449', n: "Days Gone", dev: "Bend Studio", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=449", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1259420/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1259420/library_hero.jpg", tags: ["Action", "Survival", "Open World", "Zombies"] },
  { id: '314', n: "Fallout 4", dev: "Bethesda Game Studios", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=314", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/377160/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/377160/library_hero.jpg", tags: ["RPG", "Open World", "Post-Apocalyptic", "Sci-Fi"] },
  { id: '988', n: "Horizon Zero Dawn", dev: "Guerrilla", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=988", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1151640/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1151640/library_hero.jpg", tags: ["Open World", "Adventure", "RPG", "Female Protagonist"] },
  { id: '890', n: "Halo: The Master Chief Collection", dev: "343 Industries", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=890", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/976730/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/976730/library_hero.jpg", tags: ["FPS", "Sci-Fi", "Shooter", "Multiplayer"] },
  { id: '1022', n: "Counter-Strike 2", dev: "Valve", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1022", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/library_hero.jpg", tags: ["FPS", "Shooter", "Multiplayer", "Competitive"] },
  { id: '415', n: "Doom Eternal", dev: "id Software", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=415", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/782330/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/782330/library_hero.jpg", tags: ["FPS", "Action", "Gore", "Fast-Paced"] },
  { id: '986', n: "Deathloop", dev: "Arkane Studios", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=986", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1252330/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1252330/library_hero.jpg", tags: ["FPS", "Action", "Assassin", "Time Manipulation"] },
  { id: '2', n: "Hollow Knight", dev: "Team Cherry", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=2", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/library_hero.jpg", tags: ["Metroidvania", "Action", "Indie", "Dark"] },
  { id: '946', n: "Brotato", dev: "Blobfish", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=946", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1942280/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1942280/library_hero.jpg", tags: ["Roguelike", "Action", "Casual", "Arena Shooter"] },
  { id: '620', n: "Stray", dev: "BlueTwelve Studio", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=620", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1332010/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1332010/library_hero.jpg", tags: ["Adventure", "Atmospheric", "Cat", "Indie"] },
  { id: '66', n: "Cuphead", dev: "Studio MDHR", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=66", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/268910/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/268910/library_hero.jpg", tags: ["Platformer", "Difficult", "2D", "Shoot 'Em Up"] },
  { id: '49', n: "Ori and the Will of the Wisps", dev: "Moon Studios", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=49", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1057090/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1057090/library_hero.jpg", tags: ["Metroidvania", "Platformer", "Beautiful", "Soundtrack"] },
  { id: '969', n: "Undertale", dev: "tobyfox", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=969", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/391540/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/391540/library_hero.jpg", tags: ["RPG", "Indie", "Story Rich", "Pixel Art"] },
  { id: '305', n: "It Takes Two", dev: "Hazelight", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=305", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1426210/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1426210/library_hero.jpg", tags: ["Co-op", "Adventure", "Platformer"] },
  { id: '458', n: "A Way Out", dev: "Hazelight", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=458", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1222700/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1222700/library_hero.jpg", tags: ["Co-op", "Action", "Adventure", "Prison Break"] },
  { id: '985', n: "Football Manager 2023", dev: "Sports Interactive", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=985", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1904540/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1904540/library_hero.jpg", tags: ["Sports", "Management", "Simulation", "Strategy"] },
  { id: '633', n: "NBA 2K23", dev: "Visual Concepts", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=633", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1919590/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1919590/library_hero.jpg", tags: ["Sports", "Basketball", "Simulation"] },
  { id: '462', n: "Football: PES 2021", dev: "Konami", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=462", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1259970/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1259970/library_hero.jpg", tags: ["Sports", "Football", "Simulation"] },
  { id: '974', n: "Raft", dev: "Redbeet Interactive", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=974", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/648800/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/648800/library_hero.jpg", tags: ["Survival", "Multiplayer", "Open World", "Crafting"] },
  { id: '976', n: "ARK: Survival Ascended", dev: "Studio Wildcard", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=976", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2399830/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2399830/library_hero.jpg", tags: ["Survival", "Open World", "Dinosaurs", "Multiplayer"] },
  { id: '612', n: "Subnautica: Below Zero", dev: "Unknown Worlds", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=612", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/848450/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/848450/library_hero.jpg", tags: ["Survival", "Open World", "Crafting", "Underwater"] },
  { id: '791', n: "Ratchet & Clank: Rift Apart", dev: "Insomniac Games", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=791", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1895880/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1895880/library_hero.jpg", tags: ["Action", "Platformer", "Adventure", "Sci-Fi"] },
  { id: '714', n: "SpongeBob: Battle for Bikini Bottom", dev: "Purple Lamp", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=714", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/969990/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/969990/library_hero.jpg", tags: ["Platformer", "Action", "Family", "Cartoon"] },
  { id: '687', n: "SpongeBob: The Cosmic Shake", dev: "Purple Lamp", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=687", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1282150/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1282150/library_hero.jpg", tags: ["Platformer", "Action", "Adventure"] },
  { id: '992', n: "Frostpunk 2", dev: "11 bit studios", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=992", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1601580/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1601580/library_hero.jpg", tags: ["Survival", "Strategy", "City Builder", "Post-Apocalyptic"] },
  { id: '995', n: "Cities: Skylines 2", dev: "Colossal Order", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=995", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/949230/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/949230/library_hero.jpg", tags: ["Simulation", "City Builder", "Strategy", "Management"] },
  { id: '952', n: "Supermarket Simulator", dev: "Nokta Games", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=952", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2670630/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2670630/library_hero.jpg", tags: ["Simulation", "Management", "Casual"] },
  { id: '96', n: "Attack On Titan 2", dev: "Koei Tecmo", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=96", img: "https://store-images.s-microsoft.com/image/apps.3749.67116328302209369.766d5242-c87b-4e0a-9cef-7b3e870a4a02.1558a40a-d19b-4b5d-b0fd-9c9a565fa1ae", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/601050/capsule_616x353.jpg", tags: ["Action", "Anime", "Hack and Slash", "Multiplayer"] },
  { id: '201', n: "ONE PIECE: PIRATE WARRIORS 4", dev: "Koei Tecmo", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=201", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1089090/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1089090/library_hero.jpg", tags: ["Action", "Anime", "Hack and Slash", "Co-op"] },
  { id: '1015', n: "GUILTY GEAR -STRIVE-", dev: "Arc System Works", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1015", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1384160/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1384160/library_hero.jpg", tags: ["Fighting", "Action", "Anime", "2D"] },
  { id: '1013', n: "Clair Obscur: Expedition 33", dev: "Sandfall Interactive", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1013", img: "https://cdn1.epicgames.com/spt-assets/330dace5ffc74156987f91d454ac544b/project-w-1kt2x.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2808040/library_hero.jpg", tags: ["RPG", "Turn-Based", "Fantasy", "Story Rich"] },
  { id: '1024', n: "Destiny 2", dev: "Bungie", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1024", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1085660/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1085660/library_hero.jpg", tags: ["FPS", "Free to Play", "Looter Shooter", "Multiplayer"] },
  { id: '1023', n: "War Thunder", dev: "Gaijin Entertainment", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=1023", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/236390/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/236390/library_hero.jpg", tags: ["Free to Play", "Vehicular Combat", "Simulation", "Multiplayer"] },
  { id: '515', n: "Arma 3", dev: "Bohemia Interactive", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=515", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/107410/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/107410/library_hero.jpg", tags: ["Simulation", "Military", "Shooter", "Tactical"] },
  { id: '998', n: "Schedule 1", dev: "Indie Dev", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=998", img: "https://static0.srcdn.com/wordpress/wp-content/uploads/sharedimages/2025/03/schedule-i-tag-page-cover-art.jpg", bg: "https://images.unsplash.com/photo-1506784951206-b96e42c2226f?w=1920&h=1080&fit=crop", tags: ["Adventure", "Mystery", "Indie"] },
  { id: 'MC120', n: "Minecraft 1.20 (Eaglercraft)", dev: "Some random dude", url: "https://yee.pages.dev/#/bW9yZS9tb3JlL21vZGRlZC9lYWdseWpz", img: "https://cdn.mos.cms.futurecdn.net/AZ4nyhrARyZhc69hMXAy3L.jpg", bg: "https://cdn.mos.cms.futurecdn.net/AZ4nyhrARyZhc69hMXAy3L.jpg", tags: ["Minecraft", "Open World", "Sandbox"] },
  { id: '301', n: "Minecraft: Dungeons", dev: "Mojang Studios", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=301", img: "https://myhotposters.com/cdn/shop/products/mL4386_1024x1024.jpg", bg: "https://blogs.windows.com/wp-content/uploads/prod/sites/2/2020/05/39d5d4123246e516a4511659d98873e5.jpg", tags: ["Dungeon Crawler", "RPG", "Adventure"] },
  { id: '735', n: "Minecraft: Legends", dev: "Mojang Studios", url: "https://www.raccoongame.com/wap/dist/#/platform/cloudgame/gamedetail?gid=735", img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1928870/library_600x900.jpg", bg: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1928870/library_hero.jpg", tags: ["Strategy", "Action", "Multiplayer", "Co-op"] },
]

type Game = typeof G_DATA[0]

const HERO_GAME = G_DATA[Math.floor(Math.random() * 6)]

const SECTIONS = [
  {
    title: "Top Picks",
    games: G_DATA.filter(g => ['117','209','598','963','697','625','988','765'].includes(g.id))
  },
  {
    title: "Poppy Playtime Universe",
    games: G_DATA.filter(g => g.n.toLowerCase().includes('poppy'))
  },
  {
    title: "Racing & Driving",
    games: G_DATA.filter(g => g.tags.some(t => ['Racing','Driving','Drifting'].includes(t)))
  },
  {
    title: "Horror",
    games: G_DATA.filter(g => g.tags.includes('Horror'))
  },
  {
    title: "Action & Adventure",
    games: G_DATA.filter(g => g.tags.includes('Action') && g.tags.includes('Adventure') && !g.tags.includes('Horror'))
  },
  {
    title: "Multiplayer & Co-op",
    games: G_DATA.filter(g => g.tags.some(t => ['Multiplayer','Co-op'].includes(t)))
  },
  {
    title: "Indie & Roguelike",
    games: G_DATA.filter(g => g.tags.some(t => ['Indie','Roguelike'].includes(t)))
  },
  {
    title: "Sports & Racing Sims",
    games: G_DATA.filter(g => g.tags.some(t => ['Sports','Football','Basketball'].includes(t)))
  },
  {
    title: "Anime",
    games: G_DATA.filter(g => g.tags.includes('Anime'))
  },
]

type View = 'home' | 'browser'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [browserUrl, setBrowserUrl] = useState('')
  const [activeTab, setActiveTab] = useState<'home' | 'games' | 'apps'>('home')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [heroGame] = useState<Game>(HERO_GAME)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = () => { if (!document.fullscreenElement) setIsFullscreen(false) }
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const openGame = (url: string) => {
    setBrowserUrl(url)
    setView('browser')
  }

  const goHome = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    setIsFullscreen(false)
    setView('home')
    setActiveTab('home')
  }

  const reload = () => {
    if (iframeRef.current) iframeRef.current.src = iframeRef.current.src
  }

  const openTab = (tab: 'games' | 'apps') => {
    setActiveTab(tab)
    setBrowserUrl(tab === 'games' ? `${TROXY_BASE}/a` : `${TROXY_BASE}/b`)
    setView('browser')
  }

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  if (view === 'browser') {
    return (
      <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#080808' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '8px 16px', background: 'rgba(8,8,8,0.98)',
          borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative'
        }}>
          <div style={{ position: 'absolute', left: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontFamily: 'monospace' }}>Troxy</span>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 999, padding: '3px', gap: 2
          }}>
            {(['home', 'games', 'apps'] as const).map(tab => (
              <button
                key={tab}
                onClick={tab === 'home' ? goHome : () => openTab(tab as 'games' | 'apps')}
                style={{
                  background: activeTab === tab ? 'rgba(255,255,255,0.12)' : 'transparent',
                  border: 'none', borderRadius: 999, padding: '5px 16px', cursor: 'pointer',
                  color: activeTab === tab ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)',
                  fontSize: 12, fontWeight: activeTab === tab ? 600 : 400,
                  letterSpacing: '0.02em', transition: 'all 0.15s', textTransform: 'capitalize'
                }}
              >{tab}</button>
            ))}
          </div>

          <div style={{ position: 'absolute', right: 16, display: 'flex', gap: 6 }}>
            <button onClick={reload} title="Reload" style={utilBtn}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>
            <button onClick={() => window.open(browserUrl, '_blank')} title="New tab" style={utilBtn}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </button>
            <button onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} style={{
              ...utilBtn,
              background: isFullscreen ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${isFullscreen ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
              color: isFullscreen ? 'white' : 'rgba(255,255,255,0.5)',
            }}>
              {isFullscreen ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
                  <path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V3h4"/><path d="M21 7V3h-4"/>
                  <path d="M3 17v4h4"/><path d="M21 17v4h-4"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <iframe
            ref={iframeRef}
            src={browserUrl}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            allow="fullscreen; microphone; camera; gamepad; clipboard-read; clipboard-write"
            sandbox="allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads"
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      height: '100%', overflowY: 'auto', background: '#080808',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: 'white'
    }}>
      {/* Nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '10px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'sticky', top: 0, background: 'rgba(8,8,8,0.95)', zIndex: 10
      }}>
        <div style={{ position: 'absolute', left: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', color: 'white', textTransform: 'uppercase' }}>Troxy</span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 999, padding: '3px', gap: 2
        }}>
          {[
            { label: 'Home', tab: 'home' as const, action: () => setActiveTab('home') },
            { label: 'Games', tab: 'games' as const, action: () => openTab('games') },
            { label: 'Apps', tab: 'apps' as const, action: () => openTab('apps') },
          ].map(item => (
            <button key={item.tab} onClick={item.action} style={{
              background: activeTab === item.tab ? 'rgba(255,255,255,0.12)' : 'transparent',
              border: 'none', borderRadius: 999, padding: '5px 18px', cursor: 'pointer',
              color: activeTab === item.tab ? 'white' : 'rgba(255,255,255,0.45)',
              fontSize: 13, fontWeight: activeTab === item.tab ? 600 : 400, transition: 'all 0.15s'
            }}>{item.label}</button>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div
        onClick={() => openGame(heroGame.url)}
        style={{
          margin: '0 0 32px',
          height: 420,
          cursor: 'pointer',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          position: 'relative', overflow: 'hidden',
          backgroundImage: `url(${heroGame.bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(8,8,8,0.97) 0%, rgba(8,8,8,0.4) 50%, rgba(8,8,8,0.1) 100%)'
        }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '40px 32px', zIndex: 1 }}>
          <div style={{
            display: 'inline-block', background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: 999,
            padding: '4px 14px', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)', marginBottom: 14
          }}>Featured</div>
          <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 6 }}>
            {heroGame.n}
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>{heroGame.dev}</div>
          <button
            onClick={e => { e.stopPropagation(); openGame(heroGame.url) }}
            style={{
              background: 'white', color: '#080808', border: 'none', borderRadius: 999,
              padding: '10px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              letterSpacing: '0.02em'
            }}
          >Play Now</button>
        </div>
      </div>

      {/* Sections */}
      <div style={{ padding: '0 24px 48px' }}>
        {SECTIONS.filter(s => s.games.length > 0).map(section => (
          <div key={section.title} style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 3, height: 18, background: 'white', borderRadius: 2 }} />
              <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{section.title}</span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 10
            }}>
              {section.games.map(game => (
                <div
                  key={game.id}
                  onClick={() => openGame(game.url)}
                  style={{
                    borderRadius: 10,
                    aspectRatio: '2/3',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'transform 0.15s, border-color 0.15s',
                    backgroundImage: `url(${game.img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: '#111',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.03)'
                    ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.2)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'
                    ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)'
                  }}
                >
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                    padding: '24px 10px 10px',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 2 }}>{game.n}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{game.dev}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const utilBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '50%', width: 28, height: 28,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: 'rgba(255,255,255,0.5)', transition: 'all 0.15s'
}