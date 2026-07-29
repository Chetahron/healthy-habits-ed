import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User 
} from 'firebase/auth';

// ==========================================
// **TYPES & INTERFACES**
// ==========================================
type UserStatus = 'Student' | 'Teacher' | 'N/A';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  userStatus: UserStatus;
  classroomCode: string;
  userGrade: string;
}

interface DailyLog {
  date: string;
  waterGlasses: number;
  activityMinutes: number;
  sleepHours: number;
  wholeFoods: string;
  ultraProcessed: string;
  notes: string;
}

interface StudentScore {
  id: string;
  name: string;
  score: number;
  waterAvg: number;
  activityAvg: number;
  sleepAvg: number;
  streakDays: number;
}

interface SurveyResponse {
  studentUsername: string;
  classroomCode: string;
  hardestHabit: string;
  difficulties: string[];
  resourcesOfInterest: string[];
  effects: string[];
  wantsMoreTips: string;
}

export default function App() {
  // ==========================================
  // **AUTH & PROFILE STATE**
  // ==========================================
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Auth Form State
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [displayNameInput, setDisplayNameInput] = useState<string>('');
  const [roleInput, setRoleInput] = useState<UserStatus>('Student');
  const [classCodeInput, setClassCodeInput] = useState<string>('testavg9');
  const [gradeInput, setGradeInput] = useState<string>('9th - 12th');
  const [authError, setAuthError] = useState<string>('');

  // App Navigation & UI State
  const [activePage, setActivePage] = useState<string>('My Classroom Scorecard');
  const [todayDate] = useState<string>('07/28/2026');
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string>('07/28/2026');

  // Daily Log State
  const [dailyLog, setDailyLog] = useState<DailyLog>({
    date: '07/28/2026',
    waterGlasses: 8,
    activityMinutes: 45,
    sleepHours: 8,
    wholeFoods: '80+',
    ultraProcessed: '0',
    notes: 'Felt energetic and stayed hydrated all day!',
  });

  const [logHistory, setLogHistory] = useState<Record<string, DailyLog>>({});

  // Student Survey Form State
  const [studentSurvey, setStudentSurvey] = useState<SurveyResponse>({
    studentUsername: '',
    classroomCode: '',
    hardestHabit: '',
    difficulties: [],
    resourcesOfInterest: [],
    effects: [],
    wantsMoreTips: '',
  });

  const [surveyData, setSurveyData] = useState<SurveyResponse[]>([]);

  // Mock Student Scores for Dashboard
  const [classroomStudents] = useState<StudentScore[]>([
    { id: '1', name: 'Alex M.', score: 94, waterAvg: 8.2, activityAvg: 50, sleepAvg: 8.1, streakDays: 14 },
    { id: '2', name: 'Jordan T.', score: 88, waterAvg: 7.5, activityAvg: 40, sleepAvg: 7.8, streakDays: 10 },
    { id: '3', name: 'Taylor S.', score: 85, waterAvg: 7.0, activityAvg: 35, sleepAvg: 7.5, streakDays: 7 },
    { id: '4', name: 'Sam K.', score: 81, waterAvg: 6.8, activityAvg: 30, sleepAvg: 7.2, streakDays: 5 },
  ]);

  const wholeFoodsOptions = ['0', '10', '20', '30', '40', '50', '60', '70', '80+'];
  const ultraProcessedOptions = ['0', '10', '20', '30', '40+'];

  // ==========================================
  // **FIREBASE AUTHENTICATION LISTENER**
  // ==========================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user metadata profile from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          setUserProfile(profile);
          setStudentSurvey((prev) => ({
            ...prev,
            studentUsername: profile.displayName || profile.email,
            classroomCode: profile.classroomCode,
          }));
        }
      } else {
        setUserProfile(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ==========================================
  // **FIRESTORE REAL-TIME DATA SYNCING**
  // ==========================================
  useEffect(() => {
    if (!currentUser) return;

    // Sync daily logs specific to this individual account
    const logsRef = collection(db, 'users', currentUser.uid, 'dailyLogs');
    const unsubscribeLogs = onSnapshot(logsRef, (snapshot) => {
      const fetchedLogs: Record<string, DailyLog> = {};
      snapshot.forEach((docItem) => {
        const data = docItem.data() as DailyLog;
        fetchedLogs[data.date] = data;
      });
      setLogHistory(fetchedLogs);
    });

    // Sync classroom survey responses
    const surveysRef = collection(db, 'surveys');
    const unsubscribeSurveys = onSnapshot(surveysRef, (snapshot) => {
      const fetchedSurveys: SurveyResponse[] = [];
      snapshot.forEach((docItem) => {
        fetchedSurveys.push(docItem.data() as SurveyResponse);
      });
      setSurveyData(fetchedSurveys);
    });

    return () => {
      unsubscribeLogs();
      unsubscribeSurveys();
    };
  }, [currentUser]);

  // ==========================================
  // **AUTH HANDLERS**
  // ==========================================
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isSignUp) {
        // Create Firebase Authentication Account
        const res = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        const profile: UserProfile = {
          uid: res.user.uid,
          displayName: displayNameInput || authEmail.split('@')[0],
          email: authEmail,
          userStatus: roleInput,
          classroomCode: classCodeInput,
          userGrade: gradeInput,
        };
        // Store User Profile in Firestore
        await setDoc(doc(db, 'users', res.user.uid), profile);
        setUserProfile(profile);
      } else {
        // Log in to Existing Account
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  // ==========================================
  // **LOG & SURVEY HANDLERS**
  // ==========================================
  const handleSaveDailyLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const docId = dailyLog.date.replace(/\//g, '-');
      await setDoc(doc(db, 'users', currentUser.uid, 'dailyLogs', docId), dailyLog);
      alert('Daily Log Saved to your Account!');
    } catch (error) {
      console.error('Error saving log:', error);
      alert('Failed to save log.');
    }
  };

  const handleCheckboxChange = (field: keyof SurveyResponse, value: string) => {
    setStudentSurvey((prev) => {
      const currentArr = (prev[field] as string[]) || [];
      const updatedArr = currentArr.includes(value)
        ? currentArr.filter((item) => item !== value)
        : [...currentArr, value];
      return { ...prev, [field]: updatedArr };
    });
  };

  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile) return;
    const finalSurvey = {
      ...studentSurvey,
      studentUsername: userProfile.displayName,
      classroomCode: userProfile.classroomCode,
    };
    try {
      const docId = `survey_${currentUser.uid}_${Date.now()}`;
      await setDoc(doc(db, 'surveys', docId), finalSurvey);
      alert('Survey Response Submitted!');
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Failed to submit survey.');
    }
  };

  const getAnswerCount = (category: keyof SurveyResponse, answerText: string) => {
    const code = userProfile?.classroomCode || '';
    return surveyData.filter((resp) => {
      if (resp.classroomCode !== code) return false;
      const val = resp[category];
      return Array.isArray(val) ? val.includes(answerText) : val === answerText;
    }).length;
  };

  // ==========================================
  // **LOADING SCREEN**
  // ==========================================
  if (authLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <h2>Loading Healthy Habits Ed...</h2>
      </div>
    );
  }

  // ==========================================
  // **LOGIN / SIGN-UP VIEW (UNAUTHENTICATED)**
  // ==========================================
  if (!currentUser || !userProfile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCFAF5', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleAuthSubmit} style={{ backgroundColor: '#FFF', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '360px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2 style={{ textAlign: 'center', color: '#3E6F9B', margin: 0 }}>HEALTHY HABITS ED</h2>
          <h4 style={{ textAlign: 'center', color: '#666', margin: '0 0 10px 0' }}>{isSignUp ? 'Create an Account' : 'Sign In to Your Account'}</h4>

          {authError && <div style={{ color: 'red', fontSize: '12px', textAlign: 'center' }}>{authError}</div>}

          {isSignUp && (
            <>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
                Full Name:
                <input type="text" required value={displayNameInput} onChange={(e) => setDisplayNameInput(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #CCC', marginTop: '4px' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
                Role:
                <select value={roleInput} onChange={(e) => setRoleInput(e.target.value as UserStatus)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #CCC', marginTop: '4px' }}>
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
                Classroom Code:
                <input type="text" required value={classCodeInput} onChange={(e) => setClassCodeInput(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #CCC', marginTop: '4px' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
                Grade Level:
                <input type="text" required value={gradeInput} onChange={(e) => setGradeInput(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #CCC', marginTop: '4px' }} />
              </label>
            </>
          )}

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
            Email Address:
            <input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #CCC', marginTop: '4px' }} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
            Password:
            <input type="password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #CCC', marginTop: '4px' }} />
          </label>

          <button type="submit" style={{ backgroundColor: '#3E6F9B', color: '#FFF', padding: '10px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            {isSignUp ? 'Sign Up' : 'Log In'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '13px', marginTop: '10px' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span onClick={() => setIsSignUp(!isSignUp)} style={{ color: '#3E6F9B', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}>
              {isSignUp ? 'Log In' : 'Sign Up'}
            </span>
          </div>
        </form>
      </div>
    );
  }

  // ==========================================
  // **AUTHENTICATED MAIN DASHBOARD VIEW**
  // ==========================================
  const navButtons = [
    { label: 'My Classroom Scorecard', icon: '🏫' },
    { label: 'My Scorecard', icon: '👤' },
    { label: 'My Daily Log', icon: '👤' },
    { label: 'My Daily View', icon: '👤' },
    { label: 'Learning Center', icon: '📖' },
    { label: 'Community Resources', icon: '📖' },
    { label: 'Survey', icon: '📖' },
    ...(userProfile.userStatus === 'Teacher' ? [{ label: 'Survey Results', icon: '📖' }] : []),
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Manrope, Inter, sans-serif', backgroundColor: '#FCFAF5' }}>
      
      {/* Sidebar Navigation */}
      <aside style={{ width: '260px', backgroundColor: '#3E6F9B', padding: '20px', color: '#FFF', display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>HEALTHY HABITS ED</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {navButtons.map((btn) => (
            <button
              key={btn.label}
              onClick={() => setActivePage(btn.label)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 15px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activePage === btn.label ? '#DCD3C1' : '#FCFAF5',
                color: '#202124',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <span>{btn.label}</span>
              <span>{btn.icon}</span>
            </button>
          ))}
        </nav>

        {/* User Footer / Log Out */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '15px', marginTop: '15px' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{userProfile.displayName}</div>
          <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '10px' }}>{userProfile.email}</div>
          <button onClick={handleLogout} style={{ width: '100%', backgroundColor: '#D9534F', color: '#FFF', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '30px', color: '#202124', overflowY: 'auto' }}>
        
        {/* Info Banner */}
        <div style={{ fontSize: '13px', marginBottom: '25px', lineHeight: '1.6', backgroundColor: '#FFF', padding: '12px 18px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div><strong>User:</strong> {userProfile.displayName} ({userProfile.userStatus})</div>
          <div><strong>Classroom Code:</strong> {userProfile.classroomCode}</div>
          <div><strong>Grade Level:</strong> {userProfile.userGrade}</div>
          <div><strong>Today's Date:</strong> {todayDate}</div>
        </div>

        {/* Page 1: My Classroom Scorecard */}
        {activePage === 'My Classroom Scorecard' && (
          <div>
            <h1 style={{ color: '#3E6F9B', fontSize: '24px', marginBottom: '10px' }}>My Classroom Scorecard</h1>
            <p style={{ color: '#555', marginBottom: '20px' }}>Classroom Code: <strong>{userProfile.classroomCode}</strong></p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              <div style={{ backgroundColor: '#FFF', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #3E6F9B' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>Class Health Average</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3E6F9B' }}>84.8 / 100</div>
              </div>
              <div style={{ backgroundColor: '#FFF', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #4CAF50' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>Avg Daily Water</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4CAF50' }}>7.1 Glasses</div>
              </div>
              <div style={{ backgroundColor: '#FFF', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #FF9800' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>Avg Physical Activity</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#FF9800' }}>36.0 Mins</div>
              </div>
              <div style={{ backgroundColor: '#FFF', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #9C27B0' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>Avg Sleep Duration</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#9C27B0' }}>7.5 Hours</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '15px' }}>Student Leaderboard</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #EEE' }}>
                    <th style={{ padding: '10px' }}>Student</th>
                    <th style={{ padding: '10px' }}>Score</th>
                    <th style={{ padding: '10px' }}>Water</th>
                    <th style={{ padding: '10px' }}>Activity</th>
                    <th style={{ padding: '10px' }}>Sleep</th>
                    <th style={{ padding: '10px' }}>Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {classroomStudents.map((st) => (
                    <tr key={st.id} style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{st.name}</td>
                      <td style={{ padding: '10px', color: '#3E6F9B', fontWeight: 'bold' }}>{st.score} pts</td>
                      <td style={{ padding: '10px' }}>{st.waterAvg} glasses</td>
                      <td style={{ padding: '10px' }}>{st.activityAvg} mins</td>
                      <td style={{ padding: '10px' }}>{st.sleepAvg} hrs</td>
                      <td style={{ padding: '10px', color: '#E65100', fontWeight: 'bold' }}>🔥 {st.streakDays} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Page 2: My Scorecard */}
        {activePage === 'My Scorecard' && (
          <div>
            <h1 style={{ color: '#3E6F9B', fontSize: '24px', marginBottom: '10px' }}>My Personal Scorecard</h1>
            <div style={{ backgroundColor: '#FFF', padding: '25px', borderRadius: '8px', maxWidth: '600px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '32px', margin: 0, color: '#3E6F9B' }}>92 / 100</h2>
                  <div style={{ color: '#4CAF50', fontWeight: 'bold', marginTop: '5px' }}>Grade: Excellent Healthy Habits!</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px' }}>🔥 14 Days</div>
                  <div style={{ fontSize: '12px', color: '#777' }}>Current Log Streak</div>
                </div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #EEE', margin: '15px 0' }} />
              <h4>Weekly Achievements:</h4>
              <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>✅ <strong>Water Goal:</strong> Met 6 of 7 days</li>
                <li>✅ <strong>Activity Goal:</strong> Met 5 of 7 days</li>
                <li>✅ <strong>Sleep Goal:</strong> Met 7 of 7 days</li>
                <li>⭐ <strong>Whole Foods Goal:</strong> Reached 80+ target</li>
              </ul>
            </div>
          </div>
        )}

        {/* Page 3: My Daily Log */}
        {activePage === 'My Daily Log' && (
          <div>
            <h1 style={{ color: '#3E6F9B', fontSize: '24px', marginBottom: '10px' }}>My Daily Data Log</h1>
            <p style={{ color: '#555', marginBottom: '20px' }}>Record your habits for today ({dailyLog.date}).</p>

            <form onSubmit={handleSaveDailyLog} style={{ backgroundColor: '#FFF', padding: '25px', borderRadius: '8px', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <strong>Water (Glasses):</strong>
                <input type="number" min="0" max="20" value={dailyLog.waterGlasses} onChange={(e) => setDailyLog({ ...dailyLog, waterGlasses: Number(e.target.value) })} style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <strong>Physical Activity (Minutes):</strong>
                <input type="number" min="0" max="300" value={dailyLog.activityMinutes} onChange={(e) => setDailyLog({ ...dailyLog, activityMinutes: Number(e.target.value) })} style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <strong>Sleep (Hours):</strong>
                <input type="number" min="0" max="24" value={dailyLog.sleepHours} onChange={(e) => setDailyLog({ ...dailyLog, sleepHours: Number(e.target.value) })} style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <strong>Whole Foods (% of diet):</strong>
                <select value={dailyLog.wholeFoods} onChange={(e) => setDailyLog({ ...dailyLog, wholeFoods: e.target.value })} style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px' }}>
                  {wholeFoodsOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <strong>Ultra-Processed Foods (% of diet):</strong>
                <select value={dailyLog.ultraProcessed} onChange={(e) => setDailyLog({ ...dailyLog, ultraProcessed: e.target.value })} style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px' }}>
                  {ultraProcessedOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <strong>Daily Reflections / Notes:</strong>
                <textarea rows={3} value={dailyLog.notes} onChange={(e) => setDailyLog({ ...dailyLog, notes: e.target.value })} style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px' }} />
              </label>

              <button type="submit" style={{ backgroundColor: '#3E6F9B', color: '#FFF', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Save Log to Account
              </button>
            </form>
          </div>
        )}

        {/* Page 4: My Daily View */}
        {activePage === 'My Daily View' && (
          <div>
            <h1 style={{ color: '#3E6F9B', fontSize: '24px', marginBottom: '10px' }}>My Logged History</h1>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Select Date:</label>
              <select value={selectedHistoryDate} onChange={(e) => setSelectedHistoryDate(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #CCC' }}>
                {Object.keys(logHistory).length > 0 ? (
                  Object.keys(logHistory).map((dt) => <option key={dt} value={dt}>{dt}</option>)
                ) : (
                  <option value={todayDate}>{todayDate}</option>
                )}
              </select>
            </div>

            {logHistory[selectedHistoryDate] ? (
              <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '8px', maxWidth: '500px' }}>
                <h3 style={{ color: '#3E6F9B', marginBottom: '15px' }}>Log for {selectedHistoryDate}</h3>
                <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                  <li>💧 <strong>Water:</strong> {logHistory[selectedHistoryDate].waterGlasses} glasses</li>
                  <li>🏃 <strong>Activity:</strong> {logHistory[selectedHistoryDate].activityMinutes} mins</li>
                  <li>😴 <strong>Sleep:</strong> {logHistory[selectedHistoryDate].sleepHours} hrs</li>
                  <li>🥗 <strong>Whole Foods:</strong> {logHistory[selectedHistoryDate].wholeFoods}</li>
                  <li>🍿 <strong>Ultra-Processed:</strong> {logHistory[selectedHistoryDate].ultraProcessed}</li>
                  <li>📝 <strong>Notes:</strong> {logHistory[selectedHistoryDate].notes || 'None'}</li>
                </ul>
              </div>
            ) : (
              <p style={{ color: '#888' }}>No saved log found for this date on your account.</p>
            )}
          </div>
        )}

        {/* Page 5: Learning Center */}
        {activePage === 'Learning Center' && (
          <div>
            <h1 style={{ color: '#3E6F9B', fontSize: '24px', marginBottom: '10px' }}>Learning Center</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '8px' }}>
                <h3 style={{ color: '#3E6F9B' }}>💧 Hydration Essentials</h3>
                <p style={{ color: '#555' }}>Drinking 8 glasses of water daily improves athletic performance and focus in class.</p>
              </div>
              <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '8px' }}>
                <h3 style={{ color: '#3E6F9B' }}>🥗 Whole Foods</h3>
                <p style={{ color: '#555' }}>Whole foods (fruits, vegetables, nuts) supply long-lasting energy without sugar crashes.</p>
              </div>
              <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '8px' }}>
                <h3 style={{ color: '#3E6F9B' }}>😴 Rest & Sleep</h3>
                <p style={{ color: '#555' }}>Aim for 8–10 hours per night. Turn off screens 30 minutes before sleep.</p>
              </div>
            </div>
          </div>
        )}

        {/* Page 6: Community Resources */}
        {activePage === 'Community Resources' && (
          <div>
            <h1 style={{ color: '#3E6F9B', fontSize: '24px', marginBottom: '10px' }}>Community Resources</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '700px' }}>
              <div style={{ backgroundColor: '#FFF', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #3E6F9B' }}>
                <h4 style={{ margin: 0 }}>🍎 Free Student Meals Program</h4>
                <p style={{ margin: '5px 0 0 0', color: '#555' }}>Free breakfast and lunch programs for local students.</p>
              </div>
              <div style={{ backgroundColor: '#FFF', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #3E6F9B' }}>
                <h4 style={{ margin: 0 }}>🏞️ Local Parks & Recreation</h4>
                <p style={{ margin: '5px 0 0 0', color: '#555' }}>Find public trails, fields, and basketball courts nearby.</p>
              </div>
            </div>
          </div>
        )}

        {/* Page 7: Survey */}
        {activePage === 'Survey' && (
          <div>
            <h1 style={{ color: '#3E6F9B', fontSize: '24px', marginBottom: '10px' }}>Student Healthy Habits Survey</h1>
            <form onSubmit={handleSurveySubmit} style={{ backgroundColor: '#FFF', padding: '25px', borderRadius: '8px', maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>1. Which healthy habit is the hardest for you?</p>
                {['Getting enough sleep', 'Drinking enough water', 'Being physically active'].map((opt) => (
                  <label key={opt} style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
                    <input type="radio" name="hardestHabit" value={opt} checked={studentSurvey.hardestHabit === opt} onChange={(e) => setStudentSurvey({ ...studentSurvey, hardestHabit: e.target.value })} /> {opt}
                  </label>
                ))}
              </div>

              <div>
                <p style={{ fontWeight: 'bold' }}>2. What makes healthy habits difficult?</p>
                {["I don't have enough time", 'Too much homework', "No safe place to active"].map((opt) => (
                  <label key={opt} style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
                    <input type="checkbox" checked={studentSurvey.difficulties.includes(opt)} onChange={() => handleCheckboxChange('difficulties', opt)} /> {opt}
                  </label>
                ))}
              </div>

              <button type="submit" style={{ backgroundColor: '#3E6F9B', color: '#FFF', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Submit Survey
              </button>
            </form>
          </div>
        )}

        {/* Page 8: Survey Results (Teacher Only) */}
        {activePage === 'Survey Results' && userProfile.userStatus === 'Teacher' && (
          <div>
            <h1 style={{ color: '#3E6F9B', fontSize: '24px', marginBottom: '10px' }}>Survey Results for {userProfile.classroomCode}</h1>
            <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '8px', maxWidth: '700px' }}>
              <h4>Top Obstacles Reported by Class:</h4>
              <ul>
                <li>Getting enough sleep: {getAnswerCount('hardestHabit', 'Getting enough sleep')} responses</li>
                <li>Drinking enough water: {getAnswerCount('hardestHabit', 'Drinking enough water')} responses</li>
                <li>Being physically active: {getAnswerCount('hardestHabit', 'Being physically active')} responses</li>
              </ul>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}