import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chunkText } from './document-processor';
import { generateEmbeddings } from './openai';
import { storage } from '../storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let knowledgeBaseId: number | null = null;

export async function initializeKnowledgeBase(forceReload: boolean = false): Promise<void> {
  try {
    // Check if knowledge base already exists and we're not forcing reload
    if (knowledgeBaseId && !forceReload) return;

    // Read the knowledge base file - handle both dev and production paths
    let knowledgeBasePath;
    
    // In production build (Railway), file is in root dist directory
    if (process.env.NODE_ENV === 'production') {
      knowledgeBasePath = path.join(process.cwd(), 'dist', 'knowledge-base.txt');
    } else {
      // In development, file is in server directory
      knowledgeBasePath = path.join(__dirname, '../knowledge-base.txt');
    }
    
    const content = await fs.readFile(knowledgeBasePath, 'utf-8');
    
    // Process the knowledge base
    const chunks = chunkText(content);
    const embeddings = await generateEmbeddings(chunks);
    
    // If reloading, delete the old document first
    if (knowledgeBaseId && forceReload) {
      try {
        await storage.deleteDocument(knowledgeBaseId);
      } catch (error) {
        console.warn('Could not delete old knowledge base:', error);
      }
    }
    
    // Store as a document
    const document = await storage.createDocument({
      filename: 'knowledge-base.txt',
      originalName: 'AI Assistant Knowledge Base',
      mimeType: 'text/plain',
      size: content.length,
      content,
      chunks,
      embeddings
    });
    
    knowledgeBaseId = document.id;
    console.log(`Knowledge base ${forceReload ? 'reloaded' : 'initialized'} with ID: ${knowledgeBaseId}`);
  } catch (error) {
    console.error('Failed to initialize knowledge base:', error);
  }
}

export function getKnowledgeBaseId(): number | null {
  return knowledgeBaseId;
}

export async function reloadKnowledgeBase(): Promise<void> {
  console.log('Reloading knowledge base...');
  await initializeKnowledgeBase(true);
}