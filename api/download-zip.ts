import fs from 'fs'
import path from 'path'
import JSZip from 'jszip'

export default async function handler(req: any, res: any) {
  try {
    const zip = new JSZip()
    const rootDir = process.cwd()

    const IGNORE_DIRS = new Set(['node_modules', 'dist', '.git', '.cache', '.npm'])
    const IGNORE_FILES = new Set(['.env', '.DS_Store', 'package-lock.json'])

    function addDirectoryToZip(currentDir: string, zipFolder: JSZip) {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name)

        if (entry.isDirectory()) {
          if (!IGNORE_DIRS.has(entry.name)) {
            const newZipFolder = zipFolder.folder(entry.name)
            if (newZipFolder) {
              addDirectoryToZip(fullPath, newZipFolder)
            }
          }
        } else if (entry.isFile()) {
          if (!IGNORE_FILES.has(entry.name)) {
            const content = fs.readFileSync(fullPath)
            zipFolder.file(entry.name, content)
          }
        }
      }
    }

    addDirectoryToZip(rootDir, zip)

    const buffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    })

    const timestamp = new Date().toISOString().slice(0, 10)
    const filename = `scenvy_project_${timestamp}.zip`

    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', buffer.length.toString())

    return res.status(200).send(buffer)
  } catch (error: any) {
    console.error('Error generating zip:', error)
    return res.status(500).json({ error: 'Failed to generate ZIP archive', details: error?.message })
  }
}
