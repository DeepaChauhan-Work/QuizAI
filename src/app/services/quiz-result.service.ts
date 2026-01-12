import { Injectable, inject } from '@angular/core';
import { QuizResult } from '../models/quiz-result.model';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class QuizResultService {
  private firestore: Firestore = inject(Firestore);

  async saveQuizResult(result: QuizResult): Promise<string> {
    try {
      const resultsCollection = collection(this.firestore, 'quizResults');
      const docRef = await addDoc(resultsCollection, {
        ...result,
        quizId: String(result.quizId), // Ensure quizId is stored as string
        completedAt: Timestamp.fromDate(new Date(result.completedAt))
      });
      console.log('Result saved with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving quiz result:', error);
      throw error;
    }
  }

  async getStudentResults(studentId: string): Promise<QuizResult[]> {
    try {
      console.log('Fetching results for student:', studentId);
      
      const resultsCollection = collection(this.firestore, 'quizResults');
      const studentResultsQuery = query(
        resultsCollection,
        where('studentId', '==', studentId),
        orderBy('completedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(studentResultsQuery);
      console.log('Found student results:', querySnapshot.size);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          resultId: doc.id,
          completedAt: data['completedAt']?.toDate?.()?.toISOString() || data['completedAt']
        } as QuizResult;
      });
    } catch (error) {
      console.error('Error getting student results:', error);
      return [];
    }
  }

  async getQuizResults(quizId: string | number): Promise<QuizResult[]> {
    try {
      const quizIdStr = String(quizId);
      console.log('Fetching results for quiz:', quizIdStr);
      
      const resultsCollection = collection(this.firestore, 'quizResults');
      const quizQuery = query(
        resultsCollection,
        where('quizId', '==', quizIdStr),
        orderBy('completedAt', 'desc')
      );
      
      const snapshot = await getDocs(quizQuery);
      console.log('Found quiz results:', snapshot.size);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          resultId: doc.id,
          completedAt: data['completedAt']?.toDate?.()?.toISOString() || data['completedAt']
        } as QuizResult;
      });
    } catch (error) {
      console.error('Error getting quiz results:', error);
      return [];
    }
  }
}
