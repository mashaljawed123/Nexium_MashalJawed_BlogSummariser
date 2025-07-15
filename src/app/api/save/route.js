import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MongoClient } from 'mongodb'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const mongo = new MongoClient(process.env.MONGODB_URI)

export async function POST(req) {
  const { url, summary, urduSummary, fullText } = await req.json()

  // Save to Supabase
  const { error } = await supabase.from('summaries').insert([
    {
      url,
      summary,
      urdu_summary: urduSummary,
    },
  ])

  // Save to MongoDB
  try {
    await mongo.connect()
    const db = mongo.db('blogs')
    const collection = db.collection('fulltexts')
    await collection.insertOne({ url, fullText, created_at: new Date() })
  } catch (err) {
    return NextResponse.json({ error: 'MongoDB error' }, { status: 500 })
  }

  if (error) {
    return NextResponse.json({ error: 'Supabase error' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Saved successfully' }, { status: 200 })
}
