import { Injectable, inject } from '@angular/core';
import { QuizItem, QuizQuestion } from '../models/quiz.model';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { 
  Firestore, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp
} from '@angular/fire/firestore';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private firestore: Firestore = inject(Firestore);

  private sampleQuizzes: QuizItem[] = [
    {
      quizId: 1,
      name: 'TypeScript Essentials',
      summary: 'Explore the core concepts of TypeScript programming',
      topic: 'Software Engineering',
      level: 'Beginner',
      durationMinutes: 20,
      thumbnailUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=2670',
      questionList: [
        {
          questionId: 1,
          prompt: 'Which keyword declares a constant in TypeScript?',
          choices: ['var', 'const', 'static', 'final'],
          answerIndex: 1,
          reasoning: 'const is used for constant declarations'
        },
        {
          questionId: 2,
          prompt: 'What is TypeScript primarily built upon?',
          choices: ['Python', 'JavaScript', 'Java', 'C++'],
          answerIndex: 1
        }
      ]
    },
    {
      quizId: 2,
      name: 'React Fundamentals',
      summary: 'Test your understanding of React library basics',
      topic: 'Frontend Development',
      level: 'Intermediate',
      durationMinutes: 25,
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2670',
      questionList: [
        {
          questionId: 1,
          prompt: 'What hook manages state in functional components?',
          choices: ['useEffect', 'useState', 'useContext', 'useReducer'],
          answerIndex: 1
        }
      ]
    },
    {
      quizId: 3,
      name: 'CSS Grid Layout',
      summary: 'Master CSS Grid for modern web layouts',
      topic: 'Styling',
      level: 'Intermediate',
      durationMinutes: 15,
      thumbnailUrl: 'https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?q=80&w=2671',
      questionList: [
        {
          questionId: 1,
          prompt: 'Which property activates CSS Grid?',
          choices: ['display: grid', 'grid-mode: on', 'layout: grid', 'grid: auto'],
          answerIndex: 0
        }
      ]
    }
  ];

  private genAI: GoogleGenerativeAI;

  constructor(private authService: AuthService) {
    this.genAI = new GoogleGenerativeAI(environment.geminiApiKey);
  }

  async getAllQuizzes(): Promise<QuizItem[]> {
    try {
      // Wait a bit to ensure auth is fully loaded
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const currentUserId = this.authService.getUserId();
      console.log('Getting quizzes for user:', currentUserId);
      
      if (!currentUserId) {
        console.log('No user ID, returning sample quizzes');
        return this.sampleQuizzes;
      }

      const quizzesCollection = collection(this.firestore, 'quizzes');
      
      // Query all quizzes (not filtered by user) to see what's available
      const allQuizzesQuery = query(
        quizzesCollection,
        orderBy('createdAt', 'desc')
      );
      
      console.log('Querying all quizzes from Firestore...');
      const querySnapshot = await getDocs(allQuizzesQuery);
      console.log('Found', querySnapshot.size, 'quizzes in Firestore');
      
      const firestoreQuizzes: QuizItem[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const quizUrl = `${window.location.origin}/quiz/${doc.id}`;
        console.log('Quiz doc:', doc.id, 'created by:', data['createdBy']);
        return {
          ...data,
          quizId: doc.id,
          shareUrl: quizUrl,
          createdAt: data['createdAt']?.toDate?.()?.toISOString() || data['createdAt']
        } as unknown as QuizItem;
      });

      return firestoreQuizzes.length > 0 ? firestoreQuizzes : this.sampleQuizzes;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      return this.sampleQuizzes;
    }
  }

  async findQuizById(quizId: string | number): Promise<QuizItem | undefined> {
    try {
      if (typeof quizId === 'string') {
        const docRef = doc(this.firestore, 'quizzes', quizId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            ...data,
            quizId: docSnap.id,
            createdAt: data['createdAt']?.toDate?.()?.toISOString() || data['createdAt']
          } as QuizItem;
        }
      }
      
      return this.sampleQuizzes.find(item => item.quizId === quizId);
    } catch (error) {
      console.error('Error finding quiz:', error);
      return this.sampleQuizzes.find(item => item.quizId === quizId);
    }
  }

  async searchQuizzes(topic: string, level: string): Promise<QuizItem[]> {
    try {
      const quizzesCollection = collection(this.firestore, 'quizzes');
      let q = query(quizzesCollection);

      if (topic) {
        q = query(q, where('topic', '==', topic));
      }
      if (level) {
        q = query(q, where('level', '==', level));
      }

      const querySnapshot = await getDocs(q);
      const firestoreQuizzes: QuizItem[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          quizId: doc.id,
          createdAt: data['createdAt']?.toDate?.()?.toISOString() || data['createdAt']
        } as QuizItem;
      });

      const filteredSamples = this.sampleQuizzes.filter(item => 
        (topic ? item.topic.toLowerCase() === topic.toLowerCase() : true) &&
        (level ? item.level.toLowerCase() === level.toLowerCase() : true)
      );

      return [...firestoreQuizzes, ...filteredSamples];
    } catch (error) {
      console.error('Error searching quizzes:', error);
      return this.sampleQuizzes.filter(item => 
        (topic ? item.topic.toLowerCase() === topic.toLowerCase() : true) &&
        (level ? item.level.toLowerCase() === level.toLowerCase() : true)
      );
    }
  }

  async generateAiQuiz(payload: {
    quizName: string;
    difficulty: string;
    questionCount: number;
    inputMode: string;
    prompt?: string;
    document?: File;
  }): Promise<QuizItem> {
    const model = this.genAI.getGenerativeModel({ 
      model: 'models/gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
      },
    });

    let promptText = '';
    
    if (payload.inputMode === 'prompt') {
      promptText = `Generate a ${payload.difficulty} level quiz with ${payload.questionCount} multiple choice questions about: ${payload.prompt}. 
      
      Return ONLY valid JSON in this exact format (no markdown, no explanations):
      {
        "name": "${payload.quizName}",
        "summary": "Brief description",
        "topic": "Main topic",
        "level": "${payload.difficulty}",
        "questions": [
          {
            "prompt": "Question text?",
            "choices": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "answerIndex": 0,
            "reasoning": "Explanation of correct answer"
          }
        ]
      }`;
    } else {
      // Handle document upload
      if (!payload.document) {
        throw new Error('No document provided');
      }
      const fileText = await this.readFileAsText(payload.document);
      promptText = `Based on this document content, generate a ${payload.difficulty} level quiz with ${payload.questionCount} multiple choice questions:

      ${fileText}
      
      Return ONLY valid JSON in this exact format (no markdown, no explanations):
      {
        "name": "${payload.quizName}",
        "summary": "Brief description",
        "topic": "Main topic",
        "level": "${payload.difficulty}",
        "questions": [
          {
            "prompt": "Question text?",
            "choices": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "answerIndex": 0,
            "reasoning": "Explanation of correct answer"
          }
        ]
      }`;
    }

    const result = await model.generateContent(promptText);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response text
    let cleanedText = text.trim();
    // Remove markdown code blocks if present
    cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const aiResponse = JSON.parse(cleanedText);

    // Create quiz object for Firestore
    const newQuiz = {
      name: aiResponse.name || payload.quizName,
      summary: aiResponse.summary || `AI-generated quiz on ${payload.prompt || 'uploaded content'}`,
      topic: aiResponse.topic || 'General',
      level: payload.difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
      durationMinutes: Math.ceil(payload.questionCount * 1.5),
      questionList: aiResponse.questions.map((q: any, idx: number) => ({
        questionId: idx + 1,
        prompt: q.prompt,
        choices: q.choices,
        answerIndex: q.answerIndex,
        reasoning: q.reasoning
      })),
      createdBy: this.authService.getUserId() || '',
      createdByUsername: this.authService.getUsername() || 'Anonymous',
      createdAt: Timestamp.now(),
      thumbnailUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=2670'
    };

    // Save to Firestore
    try {
      const quizzesCollection = collection(this.firestore, 'quizzes');
      const docRef = await addDoc(quizzesCollection, newQuiz);
      
      return {
        ...newQuiz,
        quizId: docRef.id,
        createdAt: newQuiz.createdAt.toDate().toISOString()
      } as QuizItem;
    } catch (error) {
      console.error('Error saving quiz to Firestore:', error);
      throw new Error('Failed to save quiz to database');
    }
  }

  private async readFileAsText(file: File): Promise<string> {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    switch (fileExtension) {
      case 'txt':
        return this.readTextFile(file);
      
      case 'pdf':
        return this.readPdfFile(file);
      
      case 'docx':
        return this.readDocxFile(file);
      
      case 'xlsx':
      case 'xls':
        return this.readExcelFile(file);
      
      default:
        throw new Error(`Unsupported file type: .${fileExtension}`);
    }
  }

  private readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  private async readPdfFile(file: File): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n';
        }

        resolve(fullText);
      } catch (error) {
        reject(new Error('Failed to read PDF file: ' + error));
      }
    });
  }

  private async readDocxFile(file: File): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        resolve(result.value);
      } catch (error) {
        reject(new Error('Failed to read DOCX file: ' + error));
      }
    });
  }

  private async readExcelFile(file: File): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        let fullText = '';

        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const sheetData = XLSX.utils.sheet_to_csv(worksheet);
          fullText += `Sheet: ${sheetName}\n${sheetData}\n\n`;
        });

        resolve(fullText);
      } catch (error) {
        reject(new Error('Failed to read Excel file: ' + error));
      }
    });
  }
}
