import { useState, useEffect } from 'react'

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

    const handler = setTimeout(async () => {
      setLoading(true)
      setError(null)
      setNotFound(false)

      try {
        const response = await fetch(`/api/products/lookup?code=${encodeURIComponent(code)}`)
        if (response.ok) {
          const data = await response.json()
          if (data.product) {
            setProduct(data.product)
          } else {
            setProduct(null)
            setNotFound(true)
          }
        }
      } catch (err: any) {
        setError(err.message)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(handler)
  }, [code])

  return { product, loading, error, notFound }
}

export function useProductSearch(query: string) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query || query.length < 2) {
      setProducts([])
      return
    }

    const handler = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/products/lookup?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
        }
      } catch (err) {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(handler)
  }, [query])

  return { products, loading }
}
