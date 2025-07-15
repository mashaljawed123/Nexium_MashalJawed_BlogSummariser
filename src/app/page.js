'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

// Urdu word dictionary
const dictionary = {
  this: 'یہ',
  is: 'ہے',
  the: 'یہ',
  full: 'مکمل',
  blog: 'بلاگ',
  text: 'متن',
  fetched: 'حاصل کیا گیا',
  from: 'سے',
  summary: 'خلاصہ',
  scraped: 'نکالا گیا',
  content: 'مواد',
  url: 'لنک',
  '': '',
}

function translateToUrdu(text) {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => dictionary[word] || word)
    .join(' ')
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [summary, setSummary] = useState('')
  const [urduSummary, setUrduSummary] = useState('')
  const [fullText, setFullText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const simulateFetch = async () => {
    setLoading(true)
    setError('')
    setSummary('')
    setUrduSummary('')
    setFullText('')

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()
      const scrapedText = data.text || 'No content found'

      const generatedSummary = `Summary: ${scrapedText.slice(0, 60)}...`
      const urdu = translateToUrdu(generatedSummary)

      setSummary(generatedSummary)
      setUrduSummary(urdu)
      setFullText(scrapedText)

      // Save to Supabase + MongoDB
      const saveRes = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          summary: generatedSummary,
          urduSummary: urdu,
          fullText: scrapedText,
        }),
      })

      if (!saveRes.ok) throw new Error('Failed to save')

      toast.success('Summary generated and saved!')
    } catch (err) {
      console.error(err)
      setError('Failed to fetch and summarise blog.')
    }

    setLoading(false)
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-center">📝 Blog Summariser</h1>
          <p className="text-center text-gray-600">Enter a blog URL to generate summaries and translations</p>

          <div className="space-y-2">
            <Label htmlFor="url">Blog URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/blog-post"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button disabled={!url || loading} onClick={simulateFetch}>
                  {loading ? 'Summarising...' : 'Summarise'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Click to fetch and summarise blog</TooltipContent>
            </Tooltip>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
          )}

          {!loading && summary && (
            <Card>
              <CardContent className="space-y-2 pt-4">
                <Badge>English Summary</Badge>
                <Textarea readOnly value={summary} className="h-24" />
              </CardContent>
            </Card>
          )}

          {!loading && urduSummary && (
            <Card>
              <CardContent className="space-y-2 pt-4">
                <Badge variant="secondary">اردو خلاصہ</Badge>
                <Textarea readOnly value={urduSummary} className="h-24 text-right" />
              </CardContent>
            </Card>
          )}

          {!loading && fullText && (
            <Card>
              <CardContent className="space-y-2 pt-4">
                <Badge variant="outline">Full Blog Text</Badge>
                <ScrollArea className="h-40 rounded-md border p-2">
                  <p className="text-sm text-muted-foreground">{fullText}</p>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
