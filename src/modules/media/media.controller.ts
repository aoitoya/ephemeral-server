import { NextFunction, Request, Response } from 'express'
import multer from 'multer'
import { basename } from 'node:path'
import { Readable } from 'node:stream'

import { MAX_FILE_SIZE } from '../../constants/media.constants.js'
import { NotFoundError, ValidationError } from '../../shared/errors/index.js'
import MediaService from './media.service.js'

const VALID_EXTENSIONS = ['gif', 'jpeg', 'jpg', 'png', 'webp']

class MediaController {
  private readonly mediaService: MediaService

  constructor() {
    this.mediaService = new MediaService()
  }

  downloadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
      Readable.fromWeb(stream).pipe(res)
    } catch (error) {
      if (error instanceof NotFoundError) {
        next(error)
        return
      }
      next(error)
    }
  }

  uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.file

      if (!file) {
        throw new ValidationError('No file provided')
      }

      const result = await this.mediaService.uploadImage(file)

      res.status(201).json({
        data: { key: result },
        status: 'success',
      })
    } catch (error) {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          next(
            new ValidationError(
              `File size exceeds ${String(MAX_FILE_SIZE / 1024 / 1024)}MB limit`
            )
          )
          return
        }
        next(new ValidationError('File upload failed'))
        return
      }
      next(error)
    }
  }
}

export default MediaController
