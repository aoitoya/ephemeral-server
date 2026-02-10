import { NextFunction, Request, Response } from 'express'
import { basename } from 'node:path'
import { Readable } from 'node:stream'

import { ValidationError } from '../../shared/errors/index.js'
import MediaService from './media.service.js'

const VALID_EXTENSIONS = ['gif', 'jpeg', 'jpg', 'png', 'webp']

class MediaController {
  private readonly mediaService: MediaService

  constructor() {
    this.mediaService = new MediaService()
  }

  downloadImage = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params

    if (!key) {
      throw new ValidationError('Key is required')
    }

    const sanitizedKey = basename(key)
    const extension = sanitizedKey.split('.').pop()?.toLowerCase()

    if (!extension || !VALID_EXTENSIONS.includes(extension)) {
      throw new ValidationError('Invalid file extension')
    }

    const { contentType, stream } =
      await this.mediaService.downloadImage(sanitizedKey)

    if (!stream) {
      return res.end()
    }

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `inline; filename="${sanitizedKey}"`)

    const readable = Readable.fromWeb(stream)
    readable.on('error', (error) => {
      next(error)
    })
    readable.pipe(res)
  }

  uploadImage = async (req: Request, res: Response, _next: NextFunction) => {
    const file = req.file

    if (!file) {
      throw new ValidationError('No file provided')
    }

    const result = await this.mediaService.uploadImage(file)

    res.status(201).json({
      data: { key: result },
      status: 'success',
    })
  }
}

export default MediaController
