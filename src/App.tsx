import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';

// ==========================================
// **TYPES & INTERFACES**
// ==========================================
type UserStatus = 'Student' | 'Teacher' | 'N/A';

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
  // **STATE MANAGEMENT**
  // ==========================================
  const [activePage, setActivePage] = useState<string>('My Classroom Scorecard');
  const [userStatus, setUserStatus] = useState<UserStatus>('Teacher');
  const [classroomCode] = useState<string>('testavg9');
  const [userGrade] = useState<string>('9th - 12th');
  const [todayDate] = useState<string>('07/28/2026');
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string>('07/28/2026');

  // Daily Log Form State
  const [dailyLog, setDailyLog] = useState<DailyLog>({
    date: '07/28/2026',
    waterGlasses: 8,
    activityMinutes: 45,
    sleepHours: 8,
    wholeFoods: '80+',
    ultraProcessed: '0',
    notes: 'Felt energetic and stayed hydrated all day!',
  });

  // Log History State (Initialized with Mock Data & Synced to Cloud)
  const [logHistory, setLogHistory] = useState<Record<string, DailyLog>>({
    '07/28/2026': {
      date: '07/28/2026',
      waterGlasses: 8,
      activityMinutes: 45,
      sleepHours: 8,
      wholeFoods: '80+',
      ultraProcessed: '0',
      notes: 'Felt energetic and stayed hydrated all day!',
    },
    '07/27/2026': {
      date: '07/27/2026',
      waterGlasses: 6,
      activityMinutes: 30,
      sleepHours: 7,
      wholeFoods: '60',
      ultraProcessed: '10',
      notes: 'Busy afternoon with soccer practice.',
    },
    '07/26/2026': {
      date: '07/26/2026',
      waterGlasses: 7,
      activityMinutes: 60,
      sleepHours: 9,
      wholeFoods: '70',
      ultraProcessed: '20',
      notes: 'Great weekend rest day.',
    },
  });

  // Student Survey Form State
  const [studentSurvey, setStudentSurvey] = useState<SurveyResponse>({
    studentUsername: 'Current Student',
    classroomCode: classroomCode,
    hardestHabit: '',
    difficulties: [],
    resourcesOfInterest: [],
    effects: [],
    wantsMoreTips: '',
  });

  // Classroom Mock Student List
  const [classroomStudents] = useState<StudentScore[]>([
    { id: '1', name: 'Alex M.', score: 94, waterAvg: 8.2, activityAvg: 50, sleepAvg: 8.1, streakDays: 14 },
    { id: '2', name: 'Jordan T.', score: 88, waterAvg: 7.5, activityAvg: 40, sleepAvg: 7.8, streakDays: 10 },
    { id: '3', name: 'Taylor S.', score: 85, waterAvg: 7.0, activityAvg: 35, sleepAvg: 7.5, streakDays: 7 },
    { id: '4', name: 'Sam K.', score: 81, waterAvg: 6.8, activityAvg: 30, sleepAvg: 7.2, streakDays: 5 },
    { id: '5', name: 'Morgan L.', score: 76, waterAvg: 6.0, activityAvg: 25, sleepAvg: 6.8, streakDays: 3 },
  ]);

  // Classroom Survey Data State (Initialized with Mock Data & Synced to Cloud)
  const [surveyData, setSurveyData] = useState<SurveyResponse[]>([
    {
      studentUsername: 'student1',
      classroomCode: 'testavg9',
      hardestHabit: 'Getting enough sleep',
      difficulties: ["I don't have enough time", "I have too much homework or other responsibilities"],
      resourcesOfInterest: ['Free student meals', 'Parks, playgrounds, and trails'],
      effects: ['I can focus better in class'],
      wantsMoreTips: 'Yes',
    },
    {
      studentUsername: 'student2',
      classroomCode: 'testavg9',
      hardestHabit: 'Drinking enough water',
      difficulties: ["I don't have enough time"],
      resourcesOfInterest: ['Homework help or tutoring'],
      effects: ['I have more energy'],
      wantsMoreTips: 'Maybe later',
    },
    {
      studentUsername: 'student3',
      classroomCode: 'testavg9',
      hardestHabit: 'Being physically active',
      difficulties: ["I don't have a safe place to be active"],
      resourcesOfInterest: ['Recreation centers', 'Youth sports'],
      effects: ['I feel stronger or more active'],
      wantsMoreTips: 'Yes',
    },
  ]);

  // Dropdown Options
  const wholeFoodsOptions = ['0', '10', '20', '30', '40', '50', '60', '70', '80+'];
  const ultraProcessedOptions = ['0', '10', '20', '30', '40+'];

  // ==========================================
  // **FIRESTORE REAL-TIME SYNC**
  // ==========================================
  useEffect(() => {
    // 1. Listen for Daily Logs updates from Firebase Cloud
    const unsubscribeLogs = onSnapshot(collection(db, 'dailyLogs'), (snapshot) => {
      const fetchedLogs: Record<string, DailyLog> = {};
      snapshot.forEach((docItem) => {
        const data = docItem.data() as DailyLog;
        fetchedLogs[data.date] = data;
      });
      if (Object.keys(fetchedLogs).length > 0) {
        setLogHistory((prev) => ({ ...prev, ...fetchedLogs }));
      }
    });

    // 2. Listen for Survey updates from Firebase Cloud
    const unsubscribeSurveys = onSnapshot(collection(db, 'surveys'), (snapshot) => {
      const fetchedSurveys: SurveyResponse[] = [];
      snapshot.forEach((docItem) => {
        fetchedSurveys.push(docItem.data() as SurveyResponse);
      });
      if (fetchedSurveys.length > 0) {
        setSurveyData((prev) => {
          // Combine local mock data with remote cloud data, avoiding duplicate usernames if present
          const existingUsernames = new Set(prev.map(s => s.studentUsername));
          const newEntries = fetchedSurveys.filter(s => !existingUsernames.has(s.studentUsername));
          return [...prev, ...newEntries];
        });
      }
    });

    return () => {
      unsubscribeLogs();
      unsubscribeSurveys();
    };
  }, []);

  // ==========================================
  // **EVENT HANDLERS & LOGIC FUNCTIONS**
  // ==========================================
  const handleSaveDailyLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create a formatted document key for Firestore (e.g. "07-28-2026")
      const docId = dailyLog.date.replace(/\//g, '-');
      
      // Save directly to Cloud Firestore
      await setDoc(doc(db, 'dailyLogs', docId), dailyLog);

      // Update local state immediately
      setLogHistory((prev) => ({
        ...prev,
        [dailyLog.date]: { ...dailyLog },
      }));
      
      alert('Daily Log Saved to Cloud Successfully!');
    } catch (error) {
      console.error('Error saving daily log to Cloud Firestore:', error);
      alert('Failed to save log to Cloud. Please check connection.');
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
    const finalSurvey = { ...studentSurvey, classroomCode };
    
    try {
      // Save directly to Cloud Firestore using a unique ID timestamp
      const timestampDocId = `survey_${Date.now()}`;
      await setDoc(doc(db, 'surveys', timestampDocId), finalSurvey);

      // Update local state immediately
      setSurveyData((prev) => [...prev, finalSurvey]);

      alert('Thank you! Your survey response has been submitted to the Cloud.');
    } catch (error) {
      console.error('Error saving survey to Cloud Firestore:', error);
      alert('Failed to submit survey to Cloud.');
    }
  };

  const getAnswerCount = (category: keyof SurveyResponse, answerText: string) => {
    return surveyData.filter((resp) => {
      if (resp.classroomCode !== classroomCode) return false;
      const val = resp[category];
      if (Array.isArray(val)) {
        return val.includes(answerText);
      }
      return val === answerText;
    }).length;
  };

  // ==========================================
  // **NAVIGATION MENU ITEMS**
  // ==========================================
  const navButtons = [
    { label: 'My Classroom Scorecard', icon: '🏫' },
    { label: 'My Scorecard', icon: '👤' },
    { label: 'My Daily Log', icon: '👤' },
    { label: 'My Daily View', icon: '👤' },
    { label: 'Learning Center', icon: '📖' },
    { label: 'Community Resources', icon: '📖' },
    { label: 'Survey', icon: '📖' },
    ...(userStatus === 'Teacher' ? [{ label: 'Survey Results', icon: '📖' }] : []),
  ];

  // ==========================================
  // **RENDER UI (JSX)**
  // ==========================================
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Manrope, Inter, sans-serif', backgroundColor: '#FCFAF5' }}>
      
      {/* ==========================================
          **LEFT NAVIGATION BAR**
          ========================================== */}
      <aside style={{ width: '260px', backgroundColor: '#3E6F9B', padding: '20px', color: '#FFF', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header Branding Logo */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px', padding: '10px 0' }}>
            HEALTHY HABITS ED
          </div>
        </div>

        {/* User Role Switcher for Testing */}
        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontSize: '12px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Toggle Role View:</label>
          <select 
            value={userStatus} 
            onChange={(e) => setUserStatus(e.target.value as UserStatus)}
            style={{ width: '100%', padding: '4px', borderRadius: '4px' }}
          >
            <option value="Teacher">Teacher</option>
            <option value="Student">Student</option>
          </select>
        </div>

        {/* Navigation Item List */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                textAlign: 'left',
              }}
            >
              <span>{btn.label}</span>
              <span style={{ fontSize: '16px' }}>{btn.icon}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ==========================================
          **RIGHT MAIN CONTENT AREA**
          ========================================== */}
      <main style={{ flex: 1, padding: '30px', color: '#202124', overflowY: 'auto' }}>
        
        {/* Top Header Information Panel */}
        <div style={{ fontSize: '13px', textAlign: 'left', marginBottom: '25px', lineHeight: '1.6', backgroundColor: '#FFF', padding: '12px 18px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div><strong>My Status:</strong> {userStatus}</div>
          <div><strong>My Classroom:</strong> {classroomCode}</div>
          <div><strong>My Grade:</strong> {userGrade}</div>
          <div><strong>Today's Date:</strong> {todayDate}</div>
        </div>

        {/* ==========================================
            **PAGE 1: MY CLASSROOM SCORECARD**
            ========================================== */}
        {activePage === 'My Classroom Scorecard' && (
          <div>
            <h1 style={{ color: '#3E6F9B', fontSize: '24px', marginBottom: '10px' }}>My Classroom Scorecard</h1>
            <p style={{ color: '#555', marginBottom: '20px' }}>Classroom Code: <strong>{classroomCode}</strong></p>

            {/* Overview Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              <div style={{ backgroundColor: '#FFF', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #3E6F9B', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>Class Health Average</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3E6F9B' }}>84.8 / 100</div>
              </div>
              <div style={{ backgroundColor: '#FFF', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #4CAF50', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>Avg Daily Water</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4CAF50' }}>7.1 Glasses</div>
              </div>
              <div style={{ backgroundColor: '#FFF', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #FF9800', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>Avg Physical Activity</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#FF9800' }}>36.0 Mins</div>
              </div>
              <div style={{ backgroundColor: '#FFF', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #9C27B0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>Avg Sleep Duration</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#9C27B0' }}>7.5 Hours</div>
              </div>
            </div>

            {/* Student Leaderboard Table */}
            <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginBottom: '15px', color: '#333' }}>Student Scoreboard & Averages</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #EEE', backgroundColor: '#F8F9FA' }}>
                    <th style={{ padding: '10px' }}>Student</th>
                    <th style={{ padding: '10px' }}>Score</th>
                    <th style={{ padding: '10px' }}>Water (Avg)</th>
                    <th style={{ padding: '10px' }}>Activity (Avg)</th>
                    <th style={{ padding: '10px' }}>Sleep (Avg)</th>
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

        {/* ==========================================
            **PAGE 2: MY SCORECARD**
            ========================================== */}
        {activePage === 'My Scorecard' && (
          <div>
            <h1 style={{ color: '#3E6F9B', fontSize: '24px', marginBottom: '10px' }}>My Scorecard</h1>
            <p style={{ color: '#555', marginBottom: '20px' }}>Your personal health score and progress summary.</p>

            {/* Individual Score Card Display */}
            <div style={{ backgroundColor: '#FFF', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', maxWidth: '600px', marginBottom: '25px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
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

              <h4 style={{ marginBottom: '10px' }}>Goal Achievements:</h4>
              <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>✅ <strong>Water Goal:</strong> Met 6 out of 7 days this week</li>
                <li>✅ <strong>Physical Activity Goal:</strong> Met 5 out of 7 days this week</li>
                <li>✅ <strong>Sleep Goal:</strong> Met 7 out of 7 days this week</li>
                <li>⭐ <strong>Whole Foods Goal:</strong> Reached 80+ whole foods target</li>
              </ul>
            </div>
          </div>
        )}

        {/* ==========================================
            **PAGE 3: MY DAILY LOG**
            ========================================== */}
        {activePage === 'My Daily Log' && (
          <div>
            <h1 style={{ color: '#3E6F9B', fontSize: '24px', marginBottom: '10px' }}>My Daily Data Log</h1>
            <p style={{ color: '#555', marginBottom: '20px' }}>Record your habits for today ({dailyLog.date}).</p>

            <form onSubmit={handleSaveDailyLog} style={{ backgroundColor: '#FFF', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <strong>Water (Glasses):</strong>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={dailyLog.waterGlasses}
                  onChange={(e) => setDailyLog({ ...dailyLog, waterGlasses: Number(e.target.value) })}
                  style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <strong>Physical Activity (Minutes):</strong>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={dailyLog.activityMinutes}
                  onChange={(e) => setDailyLog({ ...dailyLog, activityMinutes: Number(e.target.value) })}
                  style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <strong>Sleep (Hours):</strong>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={dailyLog.sleepHours}
                  onChange={(e) => setDailyLog({ ...dailyLog, sleepHours: Number(e.target.value) })}
                  style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px' }}
                />
              </label>

              {/* Whole Foods Dropdown */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <strong>Whole Foods (% of diet):</strong>
                <select
                  value={dailyLog.wholeFoods}
                  onChange={(e) => setDailyLog({ ...dailyLog, wholeFoods: e.target.value })}
                  style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px' }}
                >
                  {wholeFoodsOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>

              {/* Ultra-Processed Foods Dropdown */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <strong>Ultra-Processed Foods (% of diet):</strong>
                <select
                  value={dailyLog.ultraProcessed}
                  onChange={(e) => setDailyLog({ ...dailyLog, ultraProcessed: e.target.value })}
                  style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px' }}
                >
                  {ultraProcessedOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <strong>Daily Reflections / Notes:</strong>
                <textarea
                  rows={3}
                  value={dailyLog.notes}
                  onChange={(e) => setDailyLog({ ...dailyLog, notes: e.target.value })}
                  style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px' }}
                />
              </label>

              <button
                type="submit"
                style={{
                  backgroundColor: '#3E6F9B',
                  color: '#FFF',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: '10px',
                }}
              >
                Save Daily Log
              </button>
            </form>
          </div>
        )}

        {/* ==========================================
            **PAGE 4: MY DAILY VIEW**
            ========================================== */}
        {activePage === 'My Daily View' && (
          <div>
            <h1 style={{ color: '#3E6F9B', fontSize: '24px', marginBottom: '10px' }}>My Daily View</h1>
            <p style={{ color: '#555', marginBottom: '20px' }}>Review past logged data by date.</p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Select Date:</label>
              <select
                value={selectedHistoryDate}
                onChange={(e) => setSelectedHistoryDate(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #CCC' }}
              >
                {Object.keys(logHistory).map((dt) => (
                  <option key={dt} value={dt}>{dt}</option>
                ))}
              </select>
            </div>

            {logHistory[selectedHistoryDate] ? (
              <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', maxWidth: '500px' }}>
                <h3 style={{ color: '#3E6F9B', marginBottom: '15px' }}>Log for {selectedHistoryDate}</h3>
                <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                  <li>💧 <strong>Water Consumed:</strong> {logHistory[selectedHistoryDate].waterGlasses} glasses</li>
                  <li>🏃 <strong>Physical Activity:</strong> {logHistory[selectedHistoryDate].activityMinutes} minutes</li>
                  <li>😴 <strong>Sleep Duration:</strong> {logHistory[selectedHistoryDate].sleepHours} hours</li>
                  <li>🥗 <strong>Whole Foods Level:</strong> {logHistory[selectedHistoryDate].wholeFoods}</li>
                  <li>🍿 <strong>Ultra-Processed Level:</strong> {logHistory[selectedHistoryDate].ultraProcessed}</li>
                  <li>📝 <strong>Notes:</strong> {logHistory[selectedHistoryDate].notes || 'None'}</li>
                </ul>
              </div>
            ) : (
              <p style={{ color: '#888' }}>No log found for this date.</p>
            )}
          </div>
        )}

        {/* ==========================================
            **PAGE 5: LEARNING CENTER**
            ========================================== */}
        {activePage === 'Learning Center' && (
          <div>
            <h1 style={{ color: '#3E6F9B', fontSize: '24px', marginBottom: '10px' }}>Learning Center</h1>
            <p style={{ color: '#555', marginBottom: '20px' }}>Educational guides on daily health, nutrition, and wellness.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#3E6F9B', marginBottom: '8px' }}>💧 Hydration Essentials</h3>
                <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#555' }}>
                  Drinking at least 8 glasses of water daily boosts focus, energy, and athletic performance. Avoid sugary drinks whenever possible.
                </p>
              </div>

              <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#3E6F9B', marginBottom: '8px' }}>🥗 Whole Foods vs Ultra-Processed</h3>
                <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#555' }}>
                  Whole foods (fruits, vegetables, nuts, whole grains) provide sustained energy. Ultra-processed foods contain added sugars and preservatives that drain energy.
                </p>
              </div>

              <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#3E6F9B', marginBottom: '8px' }}>😴 Sleep Hygiene for Students</h3>
                <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#555' }}>
                  Aim for 8–10 hours of sleep per night. Turn off screens 30 minutes before bed to allow your brain to rest and recharge for class.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            **PAGE 6: COMMUNITY RESOURCES**
            ========================================== */}
        {activePage === 'Community Resources' && (
          <div>
            <h1 style={{ color: '#3E6F9B', fontSize: '24px', marginBottom: '10px' }}>Community Resources</h1>
            <p style={{ color: '#555', marginBottom: '20px' }}>Local programs and support for health, nutrition, and recreation.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '700px' }}>
              <div style={{ backgroundColor: '#FFF', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #3E6F9B', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 5px 0' }}>🍎 Free Student Meals Program</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>Provides free breakfast and lunch to eligible students throughout the school year and summer months.</p>
              </div>

              <div style={{ backgroundColor: '#FFF', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #3E6F9B', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 5px 0' }}>🏞️ Local Parks & Recreation Trails</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>Access free public parks, walking trails, and basketball courts in your neighborhood.</p>
              </div>

              <div style={{ backgroundColor: '#FFF', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #3E6F9B', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 5px 0' }}>📚 Youth Sports & Afterschool Tutoring</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>Free homework help and recreational sports programs at local community centers.</p>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            **PAGE 7: STUDENT SURVEY**
            ========================================== */}
        {activePage === 'Survey' && (
          <div>
            <h1 style={{ color: '#3E6F9B', fontSize: '24px', marginBottom: '10px' }}>Student Healthy Habits Survey</h1>
            <p style={{ color: '#555', marginBottom: '20px' }}>Help us understand what resources and support your class needs.</p>

            <form onSubmit={handleSurveySubmit} style={{ backgroundColor: '#FFF', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Question 1 */}
              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>1. Which healthy habit is the hardest for you to practice consistently?</p>
                {[
                  'Getting enough sleep',
                  'Drinking enough water',
                  'Eating fruits and vegetables',
                  'Being physically active',
                  'Limiting sugary drinks or ultra-processed foods',
                  'Nothing in particular right now',
                ].map((opt) => (
                  <label key={opt} style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                    <input
                      type="radio"
                      name="hardestHabit"
                      value={opt}
                      checked={studentSurvey.hardestHabit === opt}
                      onChange={(e) => setStudentSurvey({ ...studentSurvey, hardestHabit: e.target.value })}
                    /> {' '}
                    {opt}
                  </label>
                ))}
              </div>

              {/* Question 2 */}
              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>2. What makes healthy habits difficult for you?</p>
                {[
                  "I don't have enough time",
                  'Healthy foods or activities cost too much',
                  "I don't have transportation",
                  'I have too much homework or other responsibilities',
                  "I don't have a safe place to be active",
                  "I don't know where to find healthy resources",
                  'Something else',
                  'Nothing in particular right now',
                ].map((opt) => (
                  <label key={opt} style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      checked={studentSurvey.difficulties.includes(opt)}
                      onChange={() => handleCheckboxChange('difficulties', opt)}
                    /> {' '}
                    {opt}
                  </label>
                ))}
              </div>

              {/* Question 3 */}
              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>3. Which free community resources would you like to learn more about?</p>
                {[
                  'Free student meals',
                  'Food pantries',
                  'Recreation centers',
                  'Parks, playgrounds, and trails',
                  'Youth sports',
                  'Homework help or tutoring',
                  'Mentoring programs',
                  'None right now',
                ].map((opt) => (
                  <label key={opt} style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      checked={studentSurvey.resourcesOfInterest.includes(opt)}
                      onChange={() => handleCheckboxChange('resourcesOfInterest', opt)}
                    /> {' '}
                    {opt}
                  </label>
                ))}
              </div>

              {/* Question 4 */}
              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>4. How has practicing healthy habits affected you this month?</p>
                {[
                  'I have more energy',
                  'I can focus better in class',
                  'I’m sleeping better or more',
                  'My mood has improved',
                  'I feel stronger or more active',
                  'I haven’t noticed a difference, yet',
                ].map((opt) => (
                  <label key={opt} style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      checked={studentSurvey.effects.includes(opt)}
                      onChange={() => handleCheckboxChange('effects', opt)}
                    /> {' '}
                    {opt}
                  </label>
                ))}
              </div>

              {/* Question 5 */}
              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>5. Would you like more healthy habit tips and local resources?</p>
                {['Yes', 'Maybe later', 'No thanks'].map((opt) => (
                  <label key={opt} style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                    <input
                      type="radio"
                      name="wantsMoreTips"
                      value={opt}
                      checked={studentSurvey.wantsMoreTips === opt}
                      onChange={(e) => setStudentSurvey({ ...studentSurvey, wantsMoreTips: e.target.value })}
                    /> {' '}
                    {opt}
                  </label>
                ))}
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: '#3E6F9B',
                  color: '#FFF',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: '10px',
                }}
              >
                Submit Survey Response
              </button>
            </form>
          </div>
        )}

        {/* ==========================================
            **PAGE 8: SURVEY RESULTS (TEACHER VIEW)**
            ========================================== */}
        {activePage === 'Survey Results' && userStatus === 'Teacher' && (
          <div>
            <h1 style={{ color: '#3E6F9B', fontSize: '24px', marginBottom: '10px' }}>Classroom Survey Results</h1>
            <p style={{ color: '#555', marginBottom: '20px' }}>Aggregated feedback submitted by students in classroom <strong>{classroomCode}</strong>.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>
              
              <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#3E6F9B' }}>Top Hardest Habits:</h4>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li>Getting enough sleep: <strong>{getAnswerCount('hardestHabit', 'Getting enough sleep')} responses</strong></li>
                  <li>Drinking enough water: <strong>{getAnswerCount('hardestHabit', 'Drinking enough water')} responses</strong></li>
                  <li>Being physically active: <strong>{getAnswerCount('hardestHabit', 'Being physically active')} responses</strong></li>
                </ul>
              </div>

              <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#3E6F9B' }}>Common Obstacles Identified:</h4>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li>Not enough time: <strong>{getAnswerCount('difficulties', "I don't have enough time")} responses</strong></li>
                  <li>Too much homework / responsibilities: <strong>{getAnswerCount('difficulties', 'I have too much homework or other responsibilities')} responses</strong></li>
                  <li>No safe place to be active: <strong>{getAnswerCount('difficulties', "I don't have a safe place to be active")} responses</strong></li>
                </ul>
              </div>

              <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#3E6F9B' }}>Requested Resources:</h4>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li>Free student meals: <strong>{getAnswerCount('resourcesOfInterest', 'Free student meals')} responses</strong></li>
                  <li>Parks & trails: <strong>{getAnswerCount('resourcesOfInterest', 'Parks, playgrounds, and trails')} responses</strong></li>
                  <li>Homework help / Tutoring: <strong>{getAnswerCount('resourcesOfInterest', 'Homework help or tutoring')} responses</strong></li>
                </ul>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}