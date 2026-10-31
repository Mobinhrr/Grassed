# 🌱 Grassed Launcher

> **A customizable Minecraft Java launcher built around instances, mod
> management, and a clean green interface.**

Grassed is an unofficial Minecraft Java launcher project built with
**Electron**. Its goal is to make it easier to create separate Minecraft
setups, manage mods and resource packs, choose Java settings, and launch
different game versions from one place.

`<sub>`{=html}📌 This README describes the features documented for
**Grassed 0.2.1** in the project development conversation. Some builds
and features were not fully tested, so the feature list should be
treated as project-documented functionality rather than an independent
test report.`</sub>`{=html}

------------------------------------------------------------------------

## ✨ Features

  -----------------------------------------------------------------------
  Feature                             Status
  ----------------------------------- -----------------------------------
  Separate Minecraft instances        ✅

  Release, snapshot, beta, and alpha  ✅
  versions                            

  Fabric, Quilt, Forge, and NeoForge  ✅
  selection                           

  Automatic Java runtime download for ✅
  the selected Minecraft version      

  Custom Java executable and JVM      ✅
  arguments                           

  Per-instance RAM and display        ✅
  settings                            

  Modrinth mod browser and            ✅
  installation                        

  Resource pack and shader browsing   ✅

  Installed-content management        ✅

  Mod detection and update checking   ✅

  Offline and Authlib/Yggdrasil       ✅
  accounts                            

  Microsoft account login             🚧 Not enabled

  LiteLoader                          ⚠️ Listed in the UI, but
                                      unsupported
  -----------------------------------------------------------------------

## 🧩 Instance Management

Keep different Minecraft setups separate instead of mixing their files.

-   ✅ Create, select, rename, copy, and delete instances.
-   ✅ Give each instance its own game directory.
-   ✅ Open an instance's folder directly.
-   ✅ Choose a Minecraft version and supported mod loader.
-   ✅ Track playtime and last-played information.
-   ✅ See recent releases and snapshots from the Home page.

## 🛠️ Mods, Resource Packs & Shaders

Grassed includes a Modrinth-based content browser and tools for managing
installed content.

-   ✅ Browse Modrinth projects.
-   ✅ Filter mods by Minecraft version and loader.
-   ✅ Sort and filter by category.
-   ✅ Install mods, including required dependencies.
-   ✅ Browse and install resource packs and shader packs.
-   ✅ Enable, disable, update, or remove installed content.
-   ✅ Use **Update All** to update compatible installed mods.
-   ✅ Identify installed mods by file hash, including files that were
    renamed or installed manually.
-   ✅ Show available update information when a match is found.

**Note:** Update information depends on matching content with Modrinth
and may not be available while offline. Disabled mods are not supposed
to be silently re-enabled during update operations.

## ☕ Java & Launch Settings

-   ✅ Download a Mojang Java runtime automatically based on the
    Minecraft version.
-   ✅ Select a custom Java executable.
-   ✅ Configure extra JVM arguments.
-   ✅ Set RAM allocation globally or per instance.
-   ✅ Configure game window width and height.
-   ✅ Choose fullscreen mode.
-   ✅ Stop a running Minecraft process from the launcher.

## 👤 Accounts

-   ✅ Offline account support.

-   ✅ Authlib/Yggdrasil authentication support.

-   ✅ Multiple accounts.

-   ✅ Authlib skin upload for compatible third-party authentication
    servers.

-   🚧 **Microsoft sign-in is not enabled** in the documented 0.2.1
    build.

Offline mode and third-party authentication are not substitutes for a
Microsoft account where a server or Minecraft service requires one. Use
accounts and services you are authorized to access.

## 🎨 Interface & Personalization

-   ✅ Dark interface with green accents.
-   ✅ Home, Instances, Mods, Accounts, and Settings sections.
-   ✅ Eight accent color options.
-   ✅ Animated navigation and smooth accent transitions.
-   ✅ Home page with a Play area, recent version, and playtime
    statistics.

## 🖥️ Background & System Tray

Grassed 0.2.1 documents several ways to behave when Minecraft starts or
when the launcher window is closed.

-   ✅ Hide Grassed to the system tray.
-   ✅ Close Grassed when Minecraft launches.
-   ✅ Keep Grassed open.
-   ✅ Reopen the launcher from the tray.
-   ✅ Tray actions for opening Grassed, launching the current instance,
    switching instances, stopping Minecraft, opening the data folder,
    and exiting.
-   ✅ Single-instance protection.
-   ✅ Optional start-with-Windows behavior, where supported.
-   ✅ Minecraft logs saved to `logs/grassed-latest.log`.

If the tray is unavailable, the project describes fallback behavior so
the launcher can remain usable.

## 🔄 Launcher Updates

-   ✅ Check for launcher updates on startup.
-   ✅ Manually check for updates in Settings.
-   ✅ Configure the GitHub repository used for update checks.
-   ✅ Show an update notice when a newer release is detected.

## 📁 Data Location

The documented default data directory is:

``` text
%APPDATA%\Mobinhrr\Grassy
```

The location can be changed through the launcher's folder setting.

## 🧰 Technology

The project conversation identifies these technologies and services:

-   **Electron** --- desktop application framework.
-   **Node.js** --- application runtime and tooling.
-   **Java** --- runs Minecraft.
-   **Mojang piston-meta** --- Minecraft version metadata.
-   **Modrinth API** --- mod and content discovery.
-   **Authlib-injector** --- third-party authentication support.
-   **electron-builder** --- application packaging.

------------------------------------------------------------------------

## ⚖️ How Grassed Compares

This is a high-level comparison based on the features documented for
Grassed and the published feature sets of the other launchers. It is not
a benchmark or a claim that every feature has been tested side-by-side.

  -------------------------------------------------------------------------------------------
  Area            🌱 Grassed     🧩 MultiMC                🚀 TLauncher       ⛏️ Official
                  0.2.1                                                       Launcher
  --------------- -------------- ------------------------- ------------------ ---------------
  Separate        ✅             ✅                        ⚠️ Different       ✅
  instances                                                workflow           Installations

  Per-instance    ✅             ✅                        ✅                 ✅ Basic
  Java/settings                                                               installation
                                                                              settings

  Automatic Java  ✅             ⚠️ User-managed options   ✅ Java setup      ✅
  setup                          vary                      tools              

  Mod loader      ✅ Fabric,     ✅ Multiple loaders       ✅ Loader          ⚠️ Limited
  support         Quilt, Forge,                            installation       compared with
                  NeoForge                                 options            specialist
                                                                              launchers

  Modrinth        ✅ Built-in    ✅ Modpack import support ⚠️ Modpack/content ❌ No
  integration     browser                                  tools              equivalent
                                                                              built-in mod
                                                                              browser

  Mod update      ✅ Documented  ⚠️ More                   ⚠️ Depends on      ❌
  tools           hash detection manual/modpack-oriented   content workflow   
                  and updates                                                 

  Offline         ✅             ⚠️ Not its primary        ✅                 ❌
  accounts                       account model                                

  Microsoft       🚧 Not enabled ⚠️ Account support        ⚠️ Depends on      ✅
  sign-in                        depends on                launcher/account   
                                 build/configuration       mode               

  System tray     ✅             ⚠️ Launcher can close     ✅ Startup/close   ⚠️ Different
  behavior                       while game continues      options            launcher
                                                                              behavior

  Open-source     Project status ✅ Open-source            Not presented here ❌ Proprietary
  focus           not                                      as an open-source  
                  established                              project            
                  here                                                        
  -------------------------------------------------------------------------------------------

### 🌱 Grassed vs. MultiMC

**Where Grassed stands out** - ✅ Built-in Modrinth browsing and
installed-mod update workflow. - ✅ File-hash-based mod identification,
including renamed or manually added files. - ✅ A dedicated interface
for resource packs and shaders. - ✅ Documented tray controls and
launcher update checks.

**Where MultiMC stands out** - ✅ Mature instance-focused workflow. - ✅
Import and export options for instances and modpacks. - ✅ Detailed logs
and instance troubleshooting tools. - ✅ Established open-source
project.

**Quick take:** Choose Grassed if its integrated Modrinth and
content-management workflow is what you want. Choose MultiMC if you
prioritize a mature, established instance manager and its import/export
ecosystem.

### 🌱 Grassed vs. TLauncher

**Where Grassed stands out** - ✅ The documented feature set emphasizes
separate instances and per-instance configuration. - ✅ Modrinth
integration and hash-based mod detection/update checks are central
features. - ✅ Authlib/Yggdrasil support is documented.

**Where TLauncher stands out** - ✅ Its published feature set includes
skins and capes, launcher settings, modpacks, maps, backups, and
content-installation tools. - ✅ It offers a more established
public-facing ecosystem of guides and user features.

**Quick take:** Grassed is focused on instance management and a
Modrinth-centered workflow. TLauncher advertises a broader collection of
user-facing services and content features. Compare account, licensing,
privacy, and distribution practices before choosing a launcher.

### 🌱 Grassed vs. the Official Minecraft Launcher

**Where Grassed stands out** - ✅ More specialized mod and mod-loader
management. - ✅ Separate instances with per-instance settings. - ✅
Modrinth browsing and installed-mod update tools. - ✅ Offline and
third-party Authlib account options are documented.

**Where the Official Launcher stands out** - ✅ Official Microsoft
account sign-in and support for the standard Minecraft account flow. -
✅ Direct support from Mojang/Microsoft. - ✅ Official game installation
and update management.

**Quick take:** Choose the Official Launcher for the straightforward,
official Minecraft experience. Choose Grassed if you want a more
mod-focused launcher workflow and are comfortable with an unofficial
project.

------------------------------------------------------------------------

## ⚠️ Known Limitations

The development conversation documents these caveats for 0.2.1:

-   🚧 Microsoft sign-in is visible in the interface but is not enabled.
-   ⚠️ LiteLoader appears as an option but is not supported.
-   🐛 Forge installation for Minecraft **1.8.9** and **1.7.10** was
    reported to fail because of legacy Forge filename handling; no
    confirmed fix is documented.
-   🧪 The developer noted that full end-to-end testing had not been
    completed for the builds discussed. Syntax checks and isolated
    helper tests were performed, but that is not the same as verifying
    every feature in a packaged release.
-   🔄 Launcher update checks require a correctly configured GitHub
    owner/repository.

## 🗺️ Possible Future Improvements

Ideas that follow naturally from the documented limitations:

-   [ ] Enable Microsoft account authentication.
-   [ ] Fix and test legacy Forge installation.
-   [ ] Add automated end-to-end tests for instance creation and
    launching.
-   [ ] Improve error messages and recovery for failed downloads or
    installs.
-   [ ] Add clearer diagnostics for authentication and Java problems.
-   [ ] Continue polishing the Modrinth and installed-content workflows.

These are suggestions, not promises or confirmed roadmap items.

------------------------------------------------------------------------

## 🔗 Project References

-   [MultiMC official website](https://multimc.org/)
-   [TLauncher official website](https://tlauncher.org/)
-   [Minecraft: Java & Bedrock Edition
    download](https://www.minecraft.net/download)
-   [Modrinth](https://modrinth.com/)

## 📜 Disclaimer

Grassed is an **unofficial third-party launcher project** and is not
affiliated with, endorsed by, or sponsored by Mojang or Microsoft.
Minecraft is a trademark of Microsoft/Mojang. Use legitimate game
accounts and follow the terms that apply to Minecraft and any
third-party services you connect.

------------------------------------------------------------------------

**🌱 Grassed --- your instances, your mods, your setup.**
