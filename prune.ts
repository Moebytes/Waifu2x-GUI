/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Waifu2x Upscaler - A cute image upscaler ❤                *
 * Copyright © 2026 Moebytes <moebytes.com>                  *
 * Licensed under CC BY-NC 4.0. See license.txt for details. *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import fs from "fs"
import process from "process"

fs.unlinkSync("./node_modules/waifu2x/models/2x-AniScale.pth")
fs.unlinkSync("./node_modules/waifu2x/models/4x_WTP_descreenton.pth")
fs.unlinkSync("./node_modules/waifu2x/models/4x-NMKD-YandereNeo-Superlite.pth")

let windowsFiles = [
    "./node_modules/waifu2x/waifu2x/waifu2x-converter-cpp.exe",
    "./node_modules/waifu2x/waifu2x/opencv_world430.dll",
    "./node_modules/waifu2x/waifu2x/w2xc.dll",
    "./node_modules/waifu2x/waifu2x/w2xc.exp",
    "./node_modules/waifu2x/waifu2x/w2xc.lib",
    "./node_modules/waifu2x/waifu2x/w2xcr.exe",

    "./node_modules/waifu2x/real-esrgan/realesrgan-ncnn-vulkan.exe",
    "./node_modules/waifu2x/real-esrgan/vcomp140.dll",
    "./node_modules/waifu2x/real-esrgan/vcomp140d.dll",

    "./node_modules/waifu2x/real-cugan/realcugan-ncnn-vulkan.exe",
    "./node_modules/waifu2x/real-cugan/vcomp140.dll",

    "./node_modules/waifu2x/anime4k/win/ac_cli.exe",

    "./node_modules/waifu2x/webp/anim_dump.exe",
    "./node_modules/waifu2x/webp/cwebp.exe",
    "./node_modules/waifu2x/webp/dwebp.exe",
    "./node_modules/waifu2x/webp/img2webp.exe",
    "./node_modules/waifu2x/webp/webpmux.exe",

    "./node_modules/rife-fps/rife/rife-ncnn-vulkan.exe",
    "./node_modules/rife-fps/rife/vcomp140.dll"
]

let macFiles = [
    "./node_modules/waifu2x/waifu2x/waifu2x-ncnn-vulkan.app",

    "./node_modules/waifu2x/real-esrgan/realesrgan-ncnn-vulkan.app",

    "./node_modules/waifu2x/real-cugan/realcugan-ncnn-vulkan.app",

    "./node_modules/waifu2x/anime4k/mac/ac_cli.app",
    "./node_modules/waifu2x/anime4k/mac/libac.a",

    "./node_modules/waifu2x/webp/anim_dump.app",
    "./node_modules/waifu2x/webp/cwebp.app",
    "./node_modules/waifu2x/webp/dwebp.app",
    "./node_modules/waifu2x/webp/img2webp.app",
    "./node_modules/waifu2x/webp/webpmux.app",

    "./node_modules/rife-fps/rife/rife-ncnn-vulkan.app"
]

let linuxFiles = [
    "./node_modules/waifu2x/waifu2x/waifu2x-ncnn-vulkan",

    "./node_modules/waifu2x/real-esrgan/realesrgan-ncnn-vulkan",

    "./node_modules/waifu2x/real-cugan/realcugan-ncnn-vulkan",

    "./node_modules/waifu2x/anime4k/linux/ac_cli",
    "./node_modules/waifu2x/anime4k/linux/libac.a",
    "./node_modules/waifu2x/anime4k/linux/libOpenCL.so",

    "./node_modules/waifu2x/webp/anim_dump",
    "./node_modules/waifu2x/webp/cwebp",
    "./node_modules/waifu2x/webp/dwebp",
    "./node_modules/waifu2x/webp/img2webp",
    "./node_modules/waifu2x/webp/webpmux",

    "./node_modules/rife-fps/rife/rife-ncnn-vulkan"
]

let linuxARMFiles = [
    "./node_modules/waifu2x/waifu2x/waifu2x-ncnn-vulkan-arm",

    "./node_modules/waifu2x/real-esrgan/realesrgan-ncnn-vulkan-arm",

    "./node_modules/waifu2x/real-cugan/realcugan-ncnn-vulkan-arm",

    "./node_modules/waifu2x/anime4k/linux-arm/ac_cli",
    "./node_modules/waifu2x/anime4k/linux-arm/libac.a"
]

if (process.platform === "win32") {
    let excluded = [...macFiles, ...linuxFiles, ...linuxARMFiles]
    for (const file of excluded) {
        fs.unlinkSync(file)
    }
}

if (process.platform === "darwin") {
    let excluded = [...windowsFiles, ...linuxFiles, ...linuxARMFiles]
    for (const file of excluded) {
        fs.unlinkSync(file)
    }
}

if (process.platform === "linux") {
    let excluded = [...windowsFiles, ...macFiles, ...linuxARMFiles]
    for (const file of excluded) {
        fs.unlinkSync(file)
    }
}