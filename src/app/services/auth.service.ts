import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { 
  Auth, 
  signInAnonymously, 
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs
} from '@angular/fire/firestore';

interface User {
  uid: string;
  displayName: string | null;
  role: 'admin' | 'student';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private isInitialized = false;

  constructor() {
    // Listen to Firebase auth state changes
    // Firebase Auth already uses LOCAL persistence by default
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        await this.loadUserData(firebaseUser);
      } else {
        // Check if we have a cached user session
        const cachedUsername = localStorage.getItem('username');
        if (cachedUsername) {
          console.log('Found cached username, restoring session for:', cachedUsername);
          // Auto-login with cached username
          try {
            await this.restoreUserSession(cachedUsername);
          } catch (error) {
            console.error('Failed to restore session:', error);
            this.currentUserSubject.next(null);
            localStorage.removeItem('userId');
            localStorage.removeItem('userRole');
            localStorage.removeItem('username');
          }
        } else {
          this.currentUserSubject.next(null);
          localStorage.removeItem('userId');
          localStorage.removeItem('userRole');
        }
      }
      this.isInitialized = true;
    });
  }

  /**
   * Restore user session from cached username
   */
  private async restoreUserSession(username: string): Promise<void> {
    const trimmedUsername = username.trim().toLowerCase();
    
    // Check if username exists in Firestore
    const usersCollection = collection(this.firestore, 'users');
    const q = query(usersCollection, where('username', '==', trimmedUsername), where('isActive', '==', true));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const existingUserDoc = querySnapshot.docs[0];
      const existingUserData = existingUserDoc.data();
      
      // Sign in anonymously
      const userCredential = await signInAnonymously(this.auth);
      
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: existingUserData['displayName'] || username
        });

        const userRole: 'admin' | 'student' = existingUserData['role'] || 'admin';

        // Update last login
        await setDoc(doc(this.firestore, 'users', existingUserDoc.id), {
          ...existingUserData,
          lastLoginAt: new Date(),
          lastAuthUid: userCredential.user.uid
        });

        // Store in localStorage
        localStorage.setItem('userId', existingUserDoc.id);
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('username', username);

        const user: User = {
          uid: existingUserDoc.id,
          displayName: existingUserData['displayName'] || username,
          role: userRole
        };
        this.currentUserSubject.next(user);
      }
    }
  }

  private async loadUserData(firebaseUser: FirebaseUser): Promise<void> {
    let role: 'admin' | 'student' = 'admin';
    let userId: string = firebaseUser.uid;
    
    try {
      // Check if we have a cached persistent user ID (from Firestore user doc)
      const cachedUserId = localStorage.getItem('userId');
      const cachedRole = localStorage.getItem('userRole') as 'admin' | 'student' | null;
      
      if (cachedUserId && cachedRole) {
        // Use cached values for faster load
        userId = cachedUserId;
        role = cachedRole;
      } else {
        // Fetch from Firestore to find the persistent user document
        const userDocRef = doc(this.firestore, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          userId = userDoc.id;
          role = userDoc.data()['role'] || 'admin';
          localStorage.setItem('userId', userId);
          localStorage.setItem('userRole', role);
        } else {
          // Try to find by lastAuthUid
          const usersCollection = collection(this.firestore, 'users');
          const q = query(usersCollection, where('lastAuthUid', '==', firebaseUser.uid));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userDocSnap = querySnapshot.docs[0];
            userId = userDocSnap.id;
            role = userDocSnap.data()['role'] || 'admin';
            localStorage.setItem('userId', userId);
            localStorage.setItem('userRole', role);
          } else {
            // Fallback to Firebase UID
            localStorage.setItem('userId', firebaseUser.uid);
            localStorage.setItem('userRole', role);
          }
        }
      }

      const user: User = {
        uid: userId,
        displayName: firebaseUser.displayName,
        role: role
      };
      
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Error loading user data:', error);
      const user: User = {
        uid: userId,
        displayName: firebaseUser.displayName,
        role: 'admin'
      };
      this.currentUserSubject.next(user);
    }
  }
      
 

  get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  /**
   * Wait for auth to initialize
   */
  async waitForAuth(): Promise<void> {
    if (this.isInitialized) return;
    
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.isInitialized) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * Login with username - checks if username exists, if yes use that account, else create new
   * @param username - The username to login with
   * @param role - The role for the user (admin or student), defaults to admin
   */
  async loginWithUsername(username: string, role: 'admin' | 'student' = 'admin'): Promise<void> {
    try {
      const trimmedUsername = username.trim().toLowerCase();
      
      // Check if username already exists in Firestore
      const usersCollection = collection(this.firestore, 'users');
      const q = query(usersCollection, where('username', '==', trimmedUsername), where('isActive', '==', true));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Username exists - retrieve existing user data
        const existingUserDoc = querySnapshot.docs[0];
        const existingUserData = existingUserDoc.data();
        
        // Sign in anonymously (this creates a new Firebase Auth session)
        const userCredential = await signInAnonymously(this.auth);
        
        if (userCredential.user) {
          // Update display name to match existing username
          await updateProfile(userCredential.user, {
            displayName: existingUserData['displayName'] || username
          });

          const userRole: 'admin' | 'student' = existingUserData['role'] || role;

          // Update the user's last login
          await setDoc(doc(this.firestore, 'users', existingUserDoc.id), {
            ...existingUserData,
            lastLoginAt: new Date(),
            lastAuthUid: userCredential.user.uid,
            role: userRole
          });

          // Store in localStorage
          localStorage.setItem('userId', existingUserDoc.id);
          localStorage.setItem('userRole', userRole);
          localStorage.setItem('username', trimmedUsername);

          const user: User = {
            uid: existingUserDoc.id,
            displayName: existingUserData['displayName'] || username,
            role: userRole
          };
          this.currentUserSubject.next(user);
        }
      } else {
        // Username doesn't exist - create new user
        const userCredential = await signInAnonymously(this.auth);
        
        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: username
          });

          // Store user data in Firestore
          await setDoc(doc(this.firestore, 'users', userCredential.user.uid), {
            username: trimmedUsername,
            displayName: username,
            originalUsername: username,
            createdAt: new Date(),
            lastLoginAt: new Date(),
            authUid: userCredential.user.uid,
            isActive: true,
            role: role
          });

          // Store in localStorage
          localStorage.setItem('userId', userCredential.user.uid);
          localStorage.setItem('userRole', role);
          localStorage.setItem('username', trimmedUsername);

          const user: User = {
            uid: userCredential.user.uid,
            displayName: username,
            role: role
          };
          this.currentUserSubject.next(user);
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      localStorage.removeItem('redirectUrl');
      this.currentUserSubject.next(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  getUsername(): string | null {
    return this.currentUserSubject.value?.displayName || null;
  }

  getUserId(): string | null {
    return this.currentUserSubject.value?.uid || localStorage.getItem('userId');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if username is available
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const trimmedUsername = username.trim().toLowerCase();
      const usersCollection = collection(this.firestore, 'users');
      const q = query(usersCollection, where('username', '==', trimmedUsername), where('isActive', '==', true));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.empty;
    } catch (error) {
      console.error('Error checking username:', error);
      return true; // Allow if there's an error
    }
  }

  getUserRole(): 'admin' | 'student' | null {
    return this.currentUserSubject.value?.role || null;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  isStudent(): boolean {
    const cachedRole = localStorage.getItem('userRole');
    return this.currentUserSubject.value?.role === 'student' || cachedRole === 'student';
  }
}
