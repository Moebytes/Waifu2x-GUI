/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Waifu2x Upscaler - A cute image upscaler ❤                *
 * Copyright © 2026 Moebytes <moebytes.com>                  *
 * Licensed under CC BY-NC 4.0. See license.txt for details. *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import {app, BrowserWindow, Menu, MenuItemConstructorOptions, dialog, ipcMain, shell} from "electron"
import localShortcut from "electron-localshortcut"
import Store from "electron-store"
import dragAddon from "electron-click-drag-plugin"
import fs from "fs"
import os from "os"
import path from "path"
import sharp from "sharp"
import process from "process"
import waifu2x from "waifu2x"
import imagesMeta from "images-meta"
import functions from "./structures/functions"
import mainFunctions from "./structures/mainFunctions"
import pack from "./package.json"

process.setMaxListeners(0)
let window: Electron.BrowserWindow | null

let ffmpegPath = undefined as any
if (process.platform === "linux") ffmpegPath = path.join(app.getAppPath(), "../ffmpeg/ffmpeg")
if (process.platform === "darwin") ffmpegPath = path.join(app.getAppPath(), "../ffmpeg/ffmpeg")
if (process.platform === "win32") ffmpegPath = path.join(app.getAppPath(), "../ffmpeg/ffmpeg.exe")

let modelPath = undefined as any
if (process.platform === "linux") modelPath = path.join(app.getAppPath(), "../../models")
if (process.platform === "darwin") modelPath = path.join(app.getAppPath(), "../../models")
if (process.platform === "win32") modelPath = path.join(app.getAppPath(), "../../models")

let waifu2xPath = path.join(app.getAppPath(), "../app.asar.unpacked/node_modules/waifu2x/waifu2x")
let esrganPath = path.join(app.getAppPath(), "../app.asar.unpacked/node_modules/waifu2x/real-esrgan")
let cuganPath = path.join(app.getAppPath(), "../app.asar.unpacked/node_modules/waifu2x/real-cugan")
let anime4kPath = path.join(app.getAppPath(), "../app.asar.unpacked/node_modules/waifu2x/anime4k")
let webpPath = path.join(app.getAppPath(), "../app.asar.unpacked/node_modules/waifu2x/webp")
let rifePath = path.join(app.getAppPath(), "../app.asar.unpacked/node_modules/rife-fps/rife")
let scriptsPath = path.join(app.getAppPath(), "../app.asar.unpacked/node_modules/waifu2x/scripts")

const modelCacheLocation = path.join(app.getPath("userData"), "assets")

if (process.platform === "win32" && app.isPackaged) {
  // On Windows write the files to a location we have permission to access
  let oldFFmpeg = ffmpegPath
  let oldModels = modelPath
  let oldWaifu2x = waifu2xPath
  let oldESRGAN = esrganPath
  let oldCUGAN = cuganPath
  let oldAnime4K = anime4kPath
  let oldWebp = webpPath
  let oldRife = rifePath
  ffmpegPath = path.join(modelCacheLocation, "ffmpeg/ffmpeg.exe")
  modelPath = path.join(modelCacheLocation, "models")
  waifu2xPath = path.join(modelCacheLocation, "waifu2x")
  esrganPath = path.join(modelCacheLocation, "real-esrgan")
  cuganPath = path.join(modelCacheLocation, "real-cugan")
  anime4kPath = path.join(modelCacheLocation, "anime4k")
  webpPath = path.join(modelCacheLocation, "webp")
  rifePath = path.join(modelCacheLocation, "rife")
  if (!fs.existsSync(ffmpegPath)) mainFunctions.copyRecursive(path.dirname(oldFFmpeg), path.dirname(ffmpegPath))
  if (!fs.existsSync(modelPath)) mainFunctions.copyRecursive(oldModels, modelPath)
  if (!fs.existsSync(waifu2xPath)) mainFunctions.copyRecursive(oldWaifu2x, waifu2xPath)
  if (!fs.existsSync(esrganPath)) mainFunctions.copyRecursive(oldESRGAN, esrganPath)
  if (!fs.existsSync(cuganPath)) mainFunctions.copyRecursive(oldCUGAN, cuganPath)
  if (!fs.existsSync(anime4kPath)) mainFunctions.copyRecursive(oldAnime4K, anime4kPath)
  if (!fs.existsSync(webpPath)) mainFunctions.copyRecursive(oldWebp, webpPath)
  if (!fs.existsSync(rifePath)) mainFunctions.copyRecursive(oldRife, rifePath)
}

if (!fs.existsSync(ffmpegPath)) ffmpegPath = undefined
if (!fs.existsSync(modelPath)) modelPath = path.join(__dirname, "../../models")
if (!fs.existsSync(waifu2xPath)) waifu2xPath = path.join(__dirname, "../../node_modules/waifu2x/waifu2x")
if (!fs.existsSync(esrganPath)) esrganPath = path.join(__dirname, "../../node_modules/waifu2x/real-esrgan")
if (!fs.existsSync(cuganPath)) cuganPath = path.join(__dirname, "../../node_modules/waifu2x/real-cugan")
if (!fs.existsSync(anime4kPath)) anime4kPath = path.join(__dirname, "../../node_modules/waifu2x/anime4k")
if (!fs.existsSync(webpPath)) webpPath = path.join(__dirname, "../../node_modules/waifu2x/webp")
if (!fs.existsSync(scriptsPath)) scriptsPath = path.join(__dirname, "../../node_modules/waifu2x/scripts")
if (!fs.existsSync(rifePath)) rifePath = path.join(__dirname, "../../node_modules/rife-fps/rife")

const store = new Store()
let initialTransparent = process.platform === "win32" ? store.get("transparent", false) as boolean : true
let windowOpacity = store.get("window-opacity", 100) as number

const history: Array<{id: number, source: string, dest: string, type: "image" | "gif" | "video"}> = []
const active: Array<{id: number, source: string, dest: string, type: "image" | "gif" | "video", action: null | "stop"}> = []
const queue: Array<{started: boolean, info: any}> = []

ipcMain.handle("close", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.close()
})

ipcMain.handle("minimize", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.minimize()
})

ipcMain.handle("maximize", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return

    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
})

ipcMain.on("moveWindow", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  const handle = win?.getNativeWindowHandle()
  if (!handle) return
  const windowID = process.platform === "linux" ? handle.readUInt32LE(0) : handle
  dragAddon.startDrag(windowID)
})

ipcMain.handle("shell:openPath", (event, location: string) => {
  shell.openPath(path.normalize(location))
})

ipcMain.handle("shell:showItemInFolder", (event, location: string) => {
  shell.showItemInFolder(path.normalize(location))
})

ipcMain.handle("path:basename", (event, pathname: string, suffix?: string) => {
  return path.basename(pathname, suffix)
})

ipcMain.handle("path:extname", (event, pathname: string) => {
  return path.extname(pathname)
})

ipcMain.handle("path:normalize", (event, pathname: string) => {
  return path.normalize(pathname)
})

const quickProcess = async (image: string) => {
  const resizeImage = async (filepath: string, maxSize: number | {maxWidth: number, maxHeight: number} = 2000) => {
      let maxWidth = typeof maxSize === "number" ? maxSize : maxSize.maxWidth
      let maxHeight = typeof maxSize === "number" ? maxSize : maxSize.maxHeight
      let buffer = new Uint8Array(fs.readFileSync(filepath))
      const dim = await sharp(buffer).metadata()
      if (dim.width > maxWidth || dim.height > maxHeight) {
          buffer = await sharp(buffer)
          .resize(maxWidth, maxHeight, {fit: "inside"})
          .toBuffer().then((b) => new Uint8Array(b))
          fs.writeFileSync(filepath, buffer)
      }
      return filepath
  }

  const isTransparent = async (filepath: string) => {
        const image = sharp(filepath)
        const metadata = await image.metadata()
        if (!metadata.hasAlpha) return false

        const {data, info} = await image.ensureAlpha().raw().toBuffer({resolveWithObject: true})

        let counter = 0
        for (let i = 3; i < data.length; i += info.channels) {
            if (data[i] === 0) counter++
        }
        return counter > 100000
    }

    const convertImage = async (filepath: string, format?: string, formatOptions?: any,
        transparentFormat?: string, transparentFormatOptions?: any) => {
        let buffer = fs.readFileSync(filepath)
        let newBuffer = null as unknown as Buffer

        let targetFormat = format
        let targetOptions = formatOptions
        if (await isTransparent(filepath)) {
            if (transparentFormat) {
                targetFormat = transparentFormat
                targetOptions = transparentFormatOptions
            } else if (!format) {
                targetFormat = "webp"
                targetOptions = undefined
            }
        }
        if (!targetFormat) targetFormat = "jpg"

        switch(targetFormat) {
            case "jpg":
                newBuffer = await sharp(buffer).jpeg(targetOptions ?? {quality: 95, optimiseScans: true}).toBuffer()
                break
            case "png":
                newBuffer = await sharp(buffer).png(targetOptions ?? {compressionLevel: 7}).toBuffer()
                break
            case "webp":
                newBuffer = await sharp(buffer).webp(targetOptions ?? {quality: 90}).toBuffer()
                break
            case "avif":
                newBuffer = await sharp(buffer).avif(targetOptions ?? {quality: 80, effort: 2}).toBuffer()
                break
            case "jxl":
                newBuffer = await sharp(buffer).jxl(targetOptions ?? {quality: 90, effort: 4}).toBuffer()
                break
            default:
                newBuffer = buffer
        }

        let newFile = `${path.basename(filepath, path.extname(filepath))}.${targetFormat}`
        const newFilePath = path.join(path.dirname(filepath), newFile)
        fs.writeFileSync(filepath, newBuffer)
        fs.renameSync(filepath, newFilePath)
        return newFilePath
    }

    const upscaleImage = async (src: string, dest: string) => {
        let target = src
        let isWebp = path.extname(src) === ".webp"
        let isAvif = path.extname(src) === ".avif"
        let isJxl = path.extname(src) === ".jxl"
        if (isWebp || isAvif || isJxl) {
            fs.copyFileSync(src, dest)
            target = await convertImage(dest, "png")
        }

        let options = {
          rename: "", upscaler: "real-cugan", scale: 4,
          ffmpegPath, waifu2xPath, esrganPath,
          cuganPath, anime4kPath, scriptsPath,
          rifePath, webpPath
        }

        let result = await waifu2x.upscaleImage(target, dest, options)
        if (isWebp) {
            await convertImage(result, "webp")
        } else if (isAvif) {
            await convertImage(result, "avif")
        } else if (isJxl) {
            await convertImage(result, "jxl")
        }
        return dest
    }

    const compressedPath = path.join(path.dirname(image), `${path.basename(image, path.extname(image))}_1x${path.extname(image)}`)
    const upscaledPath = path.join(path.dirname(image), `${path.basename(image, path.extname(image))}_2x${path.extname(image)}`)

    await ensureWritable(compressedPath)
    await ensureWritable(upscaledPath)

    fs.copyFileSync(image, compressedPath)
    await resizeImage(compressedPath)
    const img = await convertImage(compressedPath)

    await upscaleImage(img, upscaledPath)
    let res = await convertImage(upscaledPath, "avif")

    shell.showItemInFolder(res)
}

ipcMain.handle("quick-process", async () => {
  if (!window) return
  const files = await dialog.showOpenDialog(window, {
    filters: [
      {name: "All Files", extensions: ["*"]},
      {name: "Images", extensions: ["png", "jpg", "jpeg", "webp", "avif", "jxl"]},
    ],
    properties: ["openFile"],
    buttonLabel: "Quick Process",
    title: "Quick Process"
  })
  const file = files.filePaths[0]
  if (!file) return
  quickProcess(file)
})

ipcMain.handle("update-color", (event, color: string) => {
  window?.webContents.send("update-color", color)
})

ipcMain.handle("preview", (event, image: string, type: string) => {
  window?.webContents.send("preview", image, type)
})

ipcMain.handle("init-settings", () => {
  return store.get("settings", null)
})

ipcMain.handle("store-settings", (event, settings) => {
  const prev = store.get("settings", {}) as object
  store.set("settings", {...prev, ...settings})
})

ipcMain.handle("advanced-settings", () => {
  window?.webContents.send("close-all-dialogs", "settings")
  window?.webContents.send("show-settings-dialog")
})

ipcMain.handle("get-theme", () => {
  return store.get("theme", "light")
})

ipcMain.handle("save-theme", (event, theme: string) => {
  store.set("theme", theme)
})

ipcMain.handle("get-os", () => {
  return store.get("os", process.platform === "darwin" ? "mac" : "windows")
})

ipcMain.handle("save-os", (event, os: string) => {
  store.set("os", os)
})

ipcMain.handle("get-transparent", () => {
  return store.get("transparent", false)
})

ipcMain.handle("save-transparent", (event, transparent: boolean) => {
  store.set("transparent", transparent)
})

ipcMain.handle("get-pinned", () => {
  return store.get("pinned", false)
})

ipcMain.handle("save-pinned", (event, pinned: boolean) => {
  store.set("pinned", pinned)
  window?.setAlwaysOnTop(pinned)
})

ipcMain.handle("open-location", async (event, location: string, create?: boolean) => {
  if (create && !fs.existsSync(location)) fs.mkdirSync(location, {recursive: true})
  if (!fs.existsSync(location)) return
  if (fs.statSync(location).isDirectory()) {
    shell.openPath(path.normalize(location))
  } else {
    shell.showItemInFolder(path.normalize(location))
  }
})

ipcMain.handle("delete-conversion", async (event, id: number, frames: boolean) => {
  let dest = ""
  let source = ""
  let type = ""
  let index = active.findIndex((a) => a.id === id)
  if (index !== -1) {
    active[index].action = "stop"
    dest = active[index].dest
    source = active[index].source
    type = active[index].type
  } else {
    index = history.findIndex((a) => a.id === id)
    if (index !== -1) {
      dest = history[index].dest
      source = history[index].source
      type = history[index].type
    }
  }
  if (dest) {
    if (type === "image") {
      if (fs.existsSync(dest)) fs.unlinkSync(dest)
    } else {
      if (frames) {
        let frameDest = `${path.dirname(source)}/${path.basename(source, path.extname(source))}Frames`
        if (type === "pdf") frameDest = `${path.dirname(dest)}/${path.basename(dest, path.extname(dest))}`
        const match = dest.match(/_\d+(?=\.)/)?.[0]
        if (match) {
          let newFrameDest = `${path.dirname(source)}/${path.basename(source, path.extname(source))}Frames${match}`
          if (type === "pdf") newFrameDest = `${path.dirname(dest)}/${path.basename(dest, path.extname(dest))}${match}`
          fs.existsSync(newFrameDest) ? mainFunctions.removeDirectory(newFrameDest) : (fs.existsSync(frameDest) ? mainFunctions.removeDirectory(frameDest) : null)
        } else {
          if (fs.existsSync(frameDest)) mainFunctions.removeDirectory(frameDest)
        }
      }
      let counter = 1
      let error = true
      while (error && counter < 20) {
        await functions.timeout(1000)
        try {
          fs.unlinkSync(dest)
          error = false
        } catch {
          // ignore
        }
        counter++
      }
    }
    return true
  }
  return false
})

ipcMain.handle("stop-conversion", async (event, id: number) => {
  const index = active.findIndex((a) => a.id === id)
  if (index !== -1) {
    active[index].action = "stop"
    return true
  }
  return false
})

ipcMain.handle("start-all", () => {
  window?.webContents.send("start-all")
})

ipcMain.handle("clear-all", () => {
  window?.webContents.send("clear-all")
})

const nextQueue = async (info: any) => {
  const index = active.findIndex((a) => a.id === info.id)
  if (index !== -1) active.splice(index, 1)
  const settings = store.get("settings", {}) as any
  let qIndex = queue.findIndex((q) => q.info.id === info.id)
  if (qIndex !== -1) {
    queue.splice(qIndex, 1)
    let concurrent = Number(settings?.queue)
    if (Number.isNaN(concurrent) || concurrent < 1) concurrent = 1
    if (active.length < concurrent) {
      const next = queue.find((q) => !q.started)
      if (next) {
        await upscale(next.info)
      }
    }
  }
}

const ensureWritable = async (dest: string) => {
  try {
    fs.writeFileSync(dest, "")
    fs.unlinkSync(dest)
    return dest
  } catch {
     if (!window) throw new Error("error")
      const save = await dialog.showSaveDialog(window, {
        title: "Select Output",
        defaultPath: dest,
        properties: ["createDirectory"]
      })

      if (save.canceled || !save.filePath) {
        throw new Error("cancelled")
      }

      return save.filePath.replace(/\\/g, "/")
  }
}

const ensureWritableQuitEarly = async (source: string, dest: string) => {
  try {
    fs.writeFileSync(dest, "")
    fs.unlinkSync(dest)
    return dest
  } catch {
    if (window) {
      await dialog.showMessageBox(window, {
        type: "error",
        title: "Non-writable location",
        message: `The output location for ${path.basename(source)} is not writable. 
          You need to open it explicitly using the folder icon.`,
        buttons: ["OK"]
      })
    }
    throw new Error("failed")
  }
}

const truncateScale = (upscaler: string, scale: number, noise: number) => {
  if (upscaler === "waifu2x") {
    if (scale <= 1) scale = 1
    else if (scale <= 2) scale = 2
    else scale = 4

    noise = Math.max(-1, Math.min(3, noise))
  }

  if (upscaler === "real-esrgan") {
    scale = Math.max(2, Math.min(4, scale))
  }

  if (upscaler === "real-cugan") {
    scale = Math.round(scale)
    scale = Math.max(1, Math.min(4, scale))

    noise = Math.max(-1, Math.min(3, noise))

    if (scale >= 3 && ![0, 3].includes(noise)) {
      noise = 0
    }
  }

  return {scale, noise}
}

const upscale = async (info: any) => {
  let qIndex = queue.findIndex((q) => q.info.id === info.id)
  if (qIndex !== -1) queue[qIndex].started = true
  const {scale, noise} = truncateScale(info.upscaler, Number(info.scale), Number(info.noise))
  const options = {
    scale,
    noise: noise as any,
    mode: info.mode,
    fpsMultiplier: Number(info.fpsMultiplier),
    quality: Number(info.quality),
    speed: Number(info.speed),
    reverse: info.reverse,
    framerate: null as any,
    jpgWebpQuality: Number(info.jpgQuality),
    pngCompression: Number(info.pngCompression),
    threads: Number(info.threads),
    rename: info.rename,
    parallelFrames: Number(info.parallelFrames),
    transparentColor: info.gifTransparency ? "#000000" : undefined,
    pitch: info.pitch,
    sdColorSpace: info.sdColorSpace,
    upscaler: mainFunctions.escape(info.upscaler),
    pngFrames: info.pngFrames,
    downscaleHeight: info.pdfDownscale ? Number(info.pdfDownscale) : undefined,
    pythonDownscale: info.pythonDownscale ? Number(info.pythonDownscale) : undefined,
    ffmpegPath,
    waifu2xPath,
    esrganPath,
    cuganPath,
    anime4kPath,
    scriptsPath,
    rifePath,
    webpPath
  }
  if (process.platform !== "win32") {
    info.source = info.source.replace("file://", "")
  }
  info.source = mainFunctions.escape(info.source)
  let overwrite = false
  if (info.dest.startsWith("{source}")) {
    if (!options.rename) overwrite = true
    info.dest = info.dest.replace("{source}", path.dirname(info.source))
  }
  let dest = waifu2x.parseDest(info.source, info.dest, options)
  const duplicate = active.find((a) => a.dest === dest)
  if (!overwrite && (fs.existsSync(dest) || duplicate)) dest = mainFunctions.newDest(dest, active)
  dest = dest.replace(/\\/g, "/")

  const action = (percent?: number) => {
    const index = active.findIndex((e) => e.id === info.id)
    if (index !== -1) {
      const action = active[index].action
      if (action === "stop") return true
    }
    if (percent !== undefined) window?.webContents.send("conversion-progress", {id: info.id, percent})
  }
  const progress = (current: number, total: number) => {
    const index = active.findIndex((e) => e.id === info.id)
    let frame = null
    if (index !== -1) {
      const action = active[index].action
      let frameDest = `${path.dirname(dest)}/${path.basename(info.source, path.extname(info.source))}Frames`
      if (info.type === "pdf") frameDest = `${path.dirname(dest)}/${path.basename(dest, path.extname(dest))}`
      if (fs.existsSync(frameDest)) {
        let frameArray = fs.readdirSync(frameDest).map((f) => `${frameDest}/${f}`).filter((f) => path.extname(f).toLowerCase() === ".png" 
        || path.extname(f).toLowerCase() === ".jpg" || path.extname(f).toLowerCase() === ".jpeg")
        frameArray = frameArray.sort(new Intl.Collator(undefined, {numeric: true, sensitivity: "base"}).compare)
        frame = frameArray[current]
      }
      if (action === "stop") return true
    }
    window?.webContents.send("conversion-progress", {id: info.id, current, total, frame})
  }
  const interlopProgress = (percent: number) => {
    const index = active.findIndex((e) => e.id === info.id)
    if (index !== -1) {
      const action = active[index].action
      if (action === "stop") return true
    }
    window?.webContents.send("interpolation-progress", {id: info.id, percent})
  }
  history.push({id: info.id, source: info.source, dest, type: info.type})
  active.push({id: info.id, source: info.source, dest, type: info.type, action: null})
  window?.webContents.send("conversion-started", {id: info.id})
  let output = ""
  let outputImage = ""
  try {
    if (info.type === "image") {
      try {
        dest = await ensureWritable(dest)
      } catch {
        window?.webContents.send("conversion-finished", {id: info.id, output: "", outputImage: ""})
        return nextQueue(info)
      }
      let meta = []
      try {
        const buffer = fs.readFileSync(info.source)
        let inMime = "image/jpeg"
        if (path.extname(info.source) === ".png") inMime = "image/png"
        meta = imagesMeta.readMeta(buffer, inMime)
        for (let i = 0; i < meta.length; i++) {
          if (typeof meta[i].value !== "string") meta[i].value = ""
          meta[i].value = meta[i].value.replaceAll("UNICODE", "").replaceAll(/\u0000/g, "")
        }
      } catch {}
      let avif = false
      let jxl = false
      let sourceExt = path.extname(info.source)
      if (path.extname(info.source) === ".avif" || path.extname(info.source) === ".jxl") {
        if (path.extname(info.source) === ".avif") avif = true
        if (path.extname(info.source) === ".jxl") jxl = true
        const buffer = await sharp(fs.readFileSync(info.source), {limitInputPixels: false}).png().toBuffer()
        const newDest = dest.replace(path.extname(dest), ".png")
        try {
          await ensureWritable(newDest)
        } catch {
          window?.webContents.send("conversion-finished", {id: info.id, output: "", outputImage: ""})
          return nextQueue(info)
        }
        fs.writeFileSync(newDest, buffer)
        info.source = newDest
        dest = newDest
      }
      output = await waifu2x.upscaleImage(info.source, dest, options, action)
      if (avif || jxl) {
        let buffer = sharp(fs.readFileSync(dest), {limitInputPixels: false})
        if (avif) buffer = buffer.avif({quality: options.jpgWebpQuality})
        if (jxl) buffer = buffer.jxl({quality: options.jpgWebpQuality})
        const newDest = dest.replace(path.extname(dest), sourceExt)
        fs.renameSync(dest, newDest)
        fs.writeFileSync(newDest, await buffer.toBuffer())
        output = newDest
      }
      if (info.compress) {
        const inputBuffer = fs.readFileSync(output)
        const outputBuffer = await sharp(inputBuffer, {limitInputPixels: false}).jpeg({optimiseScans: true, 
          trellisQuantisation: true, quality: options.jpgWebpQuality}).toBuffer()
        fs.writeFileSync(output, outputBuffer)
        const renamePath = path.join(path.dirname(output), `${path.basename(output, path.extname(output))}.jpg`)
        fs.renameSync(output, renamePath)
        output = renamePath
      }
      if (meta?.length) {
        let outMime = "image/jpeg"
        if (path.extname(output) === ".png") outMime = "image/png"
        let metaBuffer = imagesMeta.writeMeta(fs.readFileSync(output), outMime, meta, "buffer")
        fs.writeFileSync(output, metaBuffer)
      }
    } else if (info.type === "gif") {
      try {
        await ensureWritableQuitEarly(info.source, dest)
      } catch {
        window?.webContents.send("conversion-finished", {id: info.id, output: "", outputImage: ""})
        return nextQueue(info)
      }
      output = await waifu2x.upscaleGIF(info.source, dest, options, progress)
    } else if (info.type === "animated webp") {
      try {
        await ensureWritableQuitEarly(info.source, dest)
      } catch {
        window?.webContents.send("conversion-finished", {id: info.id, output: "", outputImage: ""})
        return nextQueue(info)
      }
      output = await waifu2x.upscaleAnimatedWebp(info.source, dest, options, progress)
    } else if (info.type === "animated png") {
      try {
        await ensureWritableQuitEarly(info.source, dest)
      } catch {
        window?.webContents.send("conversion-finished", {id: info.id, output: "", outputImage: ""})
        return nextQueue(info)
      }
      output = await waifu2x.upscaleAPNG(info.source, dest, options, progress)
    } else if (info.type === "video") {
      try {
        await ensureWritableQuitEarly(info.source, dest)
      } catch {
        window?.webContents.send("conversion-finished", {id: info.id, output: "", outputImage: ""})
        return nextQueue(info)
      }
      output = await waifu2x.upscaleVideo(info.source, dest, options, progress, interlopProgress)
    } else if (info.type === "pdf") {
      try {
        await ensureWritableQuitEarly(info.source, dest)
      } catch {
        window?.webContents.send("conversion-finished", {id: info.id, output: "", outputImage: ""})
        return nextQueue(info)
      }
      output = await waifu2x.upscalePDF(info.source, dest, options, progress)
      const dimensions = await waifu2x.pdfDimensions(output, {downscaleHeight: undefined})
      outputImage = dimensions.image
    }
  } catch (error) {
      console.log(error)
      output = dest
  }
  window?.webContents.send("conversion-finished", {id: info.id, output, outputImage})
  nextQueue(info)
}

ipcMain.handle("upscale", async (event, info: any, startAll: boolean) => {
  const qIndex = queue.findIndex((q) => q.info.id === info.id)
  if (qIndex === -1) queue.push({info, started: false})
  if (startAll) {
    const settings = store.get("settings", {}) as any
    let concurrent = Number(settings?.queue)
    if (Number.isNaN(concurrent) || concurrent < 1) concurrent = 1
    if (active.length < concurrent) {
      await upscale(info)
    }
  } else {
    await upscale(info)
  }
})

ipcMain.handle("update-concurrency", async (event, concurrent) => {
  if (Number.isNaN(concurrent) || concurrent < 1) concurrent = 1
  let counter = active.length
  while (counter < concurrent) {
    const next = queue.find((q) => !q.started)
    if (next) {
      counter++
      await upscale(next.info)
    } else {
      break
    }
  }
})


ipcMain.handle("move-queue", async (event, id: number) => {
  const settings = store.get("settings", {}) as any
  let concurrent = Number(settings?.queue)
  if (Number.isNaN(concurrent) || concurrent < 1) concurrent = 1
  if (id) {
    let qIndex = queue.findIndex((q) => q.info.id === id)
    if (qIndex !== -1) queue.splice(qIndex, 1)
  }
  if (active.length < concurrent) {
    const next = queue.find((q) => !q.started)
    if (next) {
      await upscale(next.info)
    }
  }
})

ipcMain.handle("get-dimensions", async (event, path: string, type: string, options?: any) => {
  if (type === "video") {
    const dimensions = await waifu2x.parseResolution(path, ffmpegPath)
    const framerate = await waifu2x.parseFramerate(path, ffmpegPath)
    return {width: dimensions.width, height: dimensions.height, framerate}
  } else if (type === "pdf") {
    const dimensions = await waifu2x.pdfDimensions(path, {downscaleHeight: undefined})
    return {width: dimensions.width, height: dimensions.height, image: dimensions.image}
  } else {
    const dimensions = await sharp(fs.readFileSync(path), {limitInputPixels: false}).metadata()
    return {width: dimensions.width, height: dimensions.height}
  }
})

ipcMain.handle("get-type", async (event, path: string) => {
  return mainFunctions.getType(path)
})

ipcMain.handle("get-python-models", (event) => {
  return fs.readdirSync(modelPath).filter((f: string) => f !== ".DS_Store").map((f: string) => path.join(modelPath, f))
})

ipcMain.handle("add-files", (event, files: string[], identifers: number[]) => {
  window?.webContents.send("add-files", files, identifers)
})

ipcMain.handle("add-file-id", (event, file: string, pos: number, id: number) => {
    window?.webContents.send("add-file-id", file, pos, id)
})

ipcMain.handle("add-file", (event, file: string, pos: number) => {
    window?.webContents.send("add-file", file, pos)
})

ipcMain.handle("select-files", async () => {
  if (!window) return
  const files = await dialog.showOpenDialog(window, {
    filters: [
      {name: "All Files", extensions: ["*"]},
      {name: "Images", extensions: ["png", "jpg", "jpeg", "webp", "avif", "jxl", "tiff"]},
      {name: "Animations", extensions: ["gif", "webp"]},
      {name: "Videos", extensions: ["mp4", "ogv", "webm", "avi", "mov", "mkv", "flv"]},
      {name: "PDF", extensions: ["pdf"]},
    ],
    properties: ["multiSelections", "openFile"]
  })
  return files.filePaths
})

ipcMain.handle("get-downloads-folder", async (event, force: boolean) => {
  if (store.has("downloads") && !force) {
    const bookmark = store.get("downloads-bookmark", "") as string
    if (bookmark) app.startAccessingSecurityScopedResource(bookmark)
    return store.get("downloads")
  } else {
    const downloads = process.platform === "darwin" ? `/Users/${os.userInfo().username}/Downloads`
      : app.getPath("downloads")
    store.set("downloads", downloads)
    return downloads
  }
})

ipcMain.handle("select-directory", async (event, dir: string) => {
  if (!window) return
  if (dir === undefined) {
    const result = await dialog.showOpenDialog(window, {
      properties: ["openDirectory", "createDirectory"],
      securityScopedBookmarks: true
    })
    dir = result.filePaths[0]
    const bookmark = result.bookmarks?.[0]
    if (bookmark) store.set("downloads-bookmark", bookmark)
  }
  if (dir) {
    store.set("downloads", dir)
    return dir
  }
})

const setWindowOpacity = (percent: number) => {
  windowOpacity = Math.max(10, Math.min(100, percent))
  store.set("window-opacity", windowOpacity)

  window?.setOpacity(windowOpacity / 100)

  applicationMenu()
}

const opacitySubmenu = (): MenuItemConstructorOptions[] => {
  const values = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10]

  return values.map(value => ({
    label: `${value}%`,
    type: "radio",
    checked: windowOpacity === value,
    click: () => setWindowOpacity(value)
  }))
}

ipcMain.handle("context-menu", (event, {hasSelection}) => {
  const template: MenuItemConstructorOptions[] = [
    {label: "Copy", enabled: hasSelection, role: "copy"},
    {label: "Paste", role: "paste"},
    {type: "separator"},
    {label: `Opacity (${windowOpacity}%)`, submenu: opacitySubmenu()}
  ]

  if (process.platform === "win32") {
    template.push(
      {label: "Open Model Cache",
        click: () => shell.openPath(modelCacheLocation)
      }
    )
  }

  const menu = Menu.buildFromTemplate(template)
  const window = BrowserWindow.fromWebContents(event.sender)
  if (window) menu.popup({window})
})

const applicationMenu = () =>  {
  const template: MenuItemConstructorOptions[] = [
    {role: "appMenu"},
    {
      label: "File",
      submenu: [
        {
          label: "Open", 
          accelerator: "CmdOrCtrl+O",
          click: (item, window) => {
            const win = window as BrowserWindow
            win.webContents.send("open-file")
          }
        }
      ]
    },
    {
      label: "Edit",
      submenu: [
        {role: "copy"},
        {role: "paste"}
      ]
    },
    {
      label: "View",
      submenu: [
        {label: `Opacity (${windowOpacity}%)`, submenu: opacitySubmenu()}
      ]
    },
    {role: "windowMenu"},
    {
      role: "help",
      submenu: [
        {role: "reload"},
        {role: "forceReload"},
        {role: "toggleDevTools"},
        {type: "separator"},
        {label: "Online Support", click: () => shell.openExternal(pack.repository)},
        {label: "Privacy Policy", click: () => shell.openExternal(pack.privacyPolicy)}
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

const singleLock = app.requestSingleInstanceLock()

if (!singleLock) {
  app.quit()
} else {
  app.on("second-instance", () => {
    if (window) {
      if (window.isMinimized()) window.restore()
      window.focus()
    }
  })

  app.on("ready", () => {
    window = new BrowserWindow({width: 800, height: 640, minWidth: 720, minHeight: 450, frame: false, hasShadow: false,
      transparent: initialTransparent, resizable: true, show: false, backgroundColor: "#00000000", center: true, webPreferences: {
      preload: path.join(__dirname, "../preload/index.js")}})
    window.loadFile(path.join(__dirname, "../renderer/index.html"))
    window.removeMenu()
    window.setOpacity(windowOpacity / 100)
    applicationMenu()
    localShortcut.register(window, "Control+Shift+I", () => {
      window?.webContents.openDevTools()
    })
    window.webContents.on("did-finish-load", () => {
      window?.show()
    })
    window.on("closed", () => {
      window = null
    })
  })
}