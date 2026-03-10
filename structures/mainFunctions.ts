/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Waifu2x Upscaler - A cute image upscaler ❤                *
 * Copyright © 2026 Moebytes <moebytes.com>                  *
 * Licensed under CC BY-NC 4.0. See license.txt for details. *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import fs from "fs"
import path from "path"
import functions from "./functions"

const images = [".png", ".apng", ".jpg", ".jpeg", ".webp", ".avif", ".jxl", ".tiff"]
const gifs = [".gif"]
const videos = [".mp4", ".ogv", ".webm", ".avi", ".mov", ".mkv", ".flv"]

export default class MainFunctions {
    public static isAnimatedWebp = (file: string) => {
        const buffer = fs.readFileSync(file)
        if (buffer.indexOf("ANMF") != -1) {
            return true
        } else {
            return false
        }
    }

    public static isAnimatedPng = (file: string) => {
        const buffer = fs.readFileSync(file)
        if (buffer.indexOf("acTL") != -1) {
            return true
        } else {
            return false
        }
    }

    public static getType = (str: string) => {
        if (str.includes(".pdf")) return "pdf"
        if (str.includes(".webp")) {
            if (MainFunctions.isAnimatedWebp(str)) {
                return "animated webp"
            } else {
                return "image"
            }
        }
        if (str.includes(".png")) {
            if (MainFunctions.isAnimatedPng(str)) {
                return "animated png"
            } else {
                return "image"
            }
        }
        if (functions.arrayIncludes(path.extname(str), images)) return "image"
        if (functions.arrayIncludes(path.extname(str), gifs)) return "gif"
        if (functions.arrayIncludes(path.extname(str), videos)) return "video"
    }

    public static newDest = (dest: string, active: any[]) => {
        let duplicate = active.find((a) => a.dest === dest)
        let i = 1
        let newDest = dest
        while (fs.existsSync(newDest) || duplicate) {
            newDest = `${path.dirname(dest)}\\${path.basename(dest, path.extname(dest))}_${i}${path.extname(dest)}`
            duplicate = active.find((a) => a.dest === newDest)
            i++
        }
        return newDest
    }
    
    public static escape = (str: string) => {
        return path.normalize(str).replace(/(?<!\\)\\(?!\\)/g, "/")
    }
    
    public static copyRecursive = (src: string, dest: string) => {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, {recursive: true})

        for (const file of fs.readdirSync(src)) {
            const srcFile = path.join(src, file)
            const destFile = path.join(dest, file)

            if (fs.statSync(srcFile).isDirectory()) {
                MainFunctions.copyRecursive(srcFile, destFile)
            } else {
                fs.copyFileSync(srcFile, destFile)
            }
        }
    }

    public static removeDirectory = (dir: string) => {
        if (dir === "/" || dir === "./") return
        if (fs.existsSync(dir)) {
            fs.readdirSync(dir).forEach(function(entry) {
                const entryPath = path.join(dir, entry)
                if (fs.lstatSync(entryPath).isDirectory()) {
                    MainFunctions.removeDirectory(entryPath)
                } else {
                    fs.unlinkSync(entryPath)
                }
            })
            try {
                fs.rmdirSync(dir)
            } catch (e) {
                console.log(e)
            }
        }
    }
}