import { useState, useEffect } from 'react'

const LOOKUP_TTL = 30_000
const SEARCH_TTL = 15_000

const lookupCache = new Map<string, { expiresAt: number; value: any }>()
const searchCache = new Map<string, { expiresAt: number; value: any[] }>()

function readLookupCache(key: string) {
  const cached = lookupCache.get(key)
  if (!cached || cached.expiresAt < Date.now()) {
    lookupCache.delete(key)
    return null
  }

  return cached.value
}

function writeLookupCache(key: string, value: any) {
  lookupCache.set(key, { value, expiresAt: Date.now() + LOOKUP_TTL })
}

function readSearchCache(key: string) {
  const cached = searchCache.get(key)
  if (!cached || cached.expiresAt < Date.now()) {
    searchCache.delete(key)
    return null
  }

  return cached.value
}

function writeSearchCache(key: string, value: any[]) {
  searchCache.set(key, { value, expiresAt: Date.now() + SEARCH_TTL })
}

export function useProductLookup(code: string) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!code || code.length < 1) {
      setProduct(null)
      setNotFound(false)
      setError(null)
      return
    }

    const normalizedCode = code.trim()
    const cachedProduct = readLookupCache(normalizedCode)
    if (cachedProduct !== null) {
      setProduct(cachedProduct)
      setNotFound(!cachedProduct)
      setError(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const handler = setTimeout(async () => {
      setLoading(true)
      setError(null)
      setNotFound(false)

      try {
        const response = await fetch(`/api/products/lookup?code=${encodeURIComponent(normalizedCode)}`, {
          signal: controller.signal,
        })
        if (response.ok) {
          const data = await response.json()
          if (data.product) {
            setProduct(data.product)
            writeLookupCache(normalizedCode, data.product)
          } else {
            setProduct(null)
            setNotFound(true)
            writeLookupCache(normalizedCode, null)
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return
        }
        setError(err.message)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => {
      controller.abort()
      clearTimeout(handler)
    }
  }, [code])

  return { product, loading, error, notFound }
}

export function useProductSearch(query: string) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query || query.length < 2) {
      setProducts([])
      setLoading(false)
      return
    }

    const normalizedQuery = query.trim().toLowerCase()
    const cachedProducts = readSearchCache(normalizedQuery)
    if (cachedProducts) {
      setProducts(cachedProducts)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const handler = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/products/lookup?q=${encodeURIComponent(normalizedQuery)}`, {
          signal: controller.signal,
        })
        if (response.ok) {
          const data = await response.json()
          const nextProducts = data.products || []
          setProducts(nextProducts)
          writeSearchCache(normalizedQuery, nextProducts)
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return
        }
        setProducts([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      controller.abort()
      clearTimeout(handler)
    }
  }, [query])

  return { products, loading }
}
