// Local storage utility for images using IndexedDB
class ImageStorage {
  private dbName = 'piccur-images'
  private dbVersion = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'id', autoIncrement: true })
        }
        if (!db.objectStoreNames.contains('albums')) {
          db.createObjectStore('albums', { keyPath: 'id', autoIncrement: true })
        }
      }
    })
  }

  async saveImage(file: File): Promise<string> {
    await this.init()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        // Get image dimensions
        const img = new Image()
        img.onload = () => {
          const imageData = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
            size: file.size,
            data: e.target?.result as string,
            width: img.width,
            height: img.height,
            aspectRatio: img.width / img.height,
            uploadedAt: new Date().toISOString(),
          }

          const transaction = this.db!.transaction(['images'], 'readwrite')
          const store = transaction.objectStore('images')
          const request = store.add(imageData)

          request.onsuccess = () => resolve(imageData.id)
          request.onerror = () => reject(request.error)
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }

  async getImage(id: string): Promise<any> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['images'], 'readonly')
      const store = transaction.objectStore('images')
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllImages(): Promise<any[]> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['images'], 'readonly')
      const store = transaction.objectStore('images')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async deleteImage(id: string): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['images'], 'readwrite')
      const store = transaction.objectStore('images')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async saveAlbum(album: any): Promise<string> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['albums'], 'readwrite')
      const store = transaction.objectStore('albums')
      const request = store.put(album)

      request.onsuccess = () => resolve(album.id)
      request.onerror = () => reject(request.error)
    })
  }

  async getAlbum(id: string): Promise<any> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['albums'], 'readonly')
      const store = transaction.objectStore('albums')
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllAlbums(): Promise<any[]> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['albums'], 'readonly')
      const store = transaction.objectStore('albums')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async deleteAlbum(id: string): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['albums'], 'readwrite')
      const store = transaction.objectStore('albums')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

export const imageStorage = new ImageStorage()

