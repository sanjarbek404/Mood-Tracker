import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from './lib/utils';

const MOODS = [
  { value: 5, emoji: '😁', label: 'Awesome', color: 'bg-green-500', text: 'text-green-500' },
  { value: 4, emoji: '🙂', label: 'Good', color: 'bg-teal-400', text: 'text-teal-400' },
  { value: 3, emoji: '😐', label: 'Okay', color: 'bg-yellow-400', text: 'text-yellow-400' },
  { value: 2, emoji: '🙁', label: 'Bad', color: 'bg-orange-400', text: 'text-orange-400' },
  { value: 1, emoji: '😭', label: 'Awful', color: 'bg-red-500', text: 'text-red-500' },
];

interface MoodEntry {
  id: string;
  date: string;
  fullDate: string;
  value: number;
  note?: string;
}

const generateMockData = (): MoodEntry[] => {
  const data: MoodEntry[] = [];
  const today = new Date();
  for (let i = 6; i >= 1; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      id: Math.random().toString(36).substring(7),
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: date.toISOString(),
      value: Math.floor(Math.random() * 3) + 3, // Random mood between 3 and 5
    });
  }
  return data;
};

export default function App() {
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isSubmittedToday, setIsSubmittedToday] = useState(false);

  useEffect(() => {
    // Load from local storage or use mock data
    const saved = localStorage.getItem('moodHistory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
        // Check if submitted today
        const todayStr = new Date().toLocaleDateString('en-US');
        const hasToday = parsed.some((entry: MoodEntry) => 
          new Date(entry.fullDate).toLocaleDateString('en-US') === todayStr
        );
        setIsSubmittedToday(hasToday);
      } catch (e) {
        setHistory(generateMockData());
      }
    } else {
      setHistory(generateMockData());
    }
  }, []);

  const handleSaveMood = () => {
    if (!selectedMood) return;

    const today = new Date();
    const newEntry: MoodEntry = {
      id: Math.random().toString(36).substring(7),
      date: today.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: today.toISOString(),
      value: selectedMood,
      note: note.trim(),
    };

    const newHistory = [...history, newEntry];
    setHistory(newHistory);
    localStorage.setItem('moodHistory', JSON.stringify(newHistory));
    setIsSubmittedToday(true);
    setSelectedMood(null);
    setNote('');
  };

  const getMoodByValue = (val: number) => MOODS.find(m => m.value === val) || MOODS[2];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const moodVal = payload[0].value;
      const mood = getMoodByValue(moodVal);
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100">
          <p className="font-medium text-gray-900 mb-1">{new Date(data.fullDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{mood.emoji}</span>
            <span className={cn("font-semibold", mood.text)}>{mood.label}</span>
          </div>
          {data.note && (
            <p className="text-sm text-gray-600 mt-2 italic">"{data.note}"</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-3">
            Mood Tracker
          </h1>
          <p className="text-lg text-gray-500">
            How are you feeling today?
          </p>
        </header>

        <main className="space-y-8">
          {/* Mood Input Section */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
            {isSubmittedToday ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <span className="text-3xl">✨</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set for today!</h2>
                <p className="text-gray-500">Come back tomorrow to log your mood.</p>
                <button 
                  onClick={() => setIsSubmittedToday(false)}
                  className="mt-6 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Log another mood anyway
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                  {MOODS.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className={cn(
                        "flex flex-col items-center p-4 rounded-2xl transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                        selectedMood === mood.value 
                          ? "bg-gray-50 ring-2 ring-blue-500 shadow-md scale-105" 
                          : "hover:bg-gray-50 hover:shadow-sm grayscale hover:grayscale-0 opacity-70 hover:opacity-100"
                      )}
                    >
                      <span className="text-5xl sm:text-6xl mb-3 block transition-transform">{mood.emoji}</span>
                      <span className={cn(
                        "text-sm font-medium transition-colors",
                        selectedMood === mood.value ? mood.text : "text-gray-500"
                      )}>
                        {mood.label}
                      </span>
                    </button>
                  ))}
                </div>

                {selectedMood && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-md mx-auto space-y-4">
                    <div>
                      <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                        Add a note (optional)
                      </label>
                      <textarea
                        id="note"
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none p-3 text-sm outline-none transition-colors"
                        placeholder="Why are you feeling this way?"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={handleSaveMood}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Save Mood
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* History Chart Section */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">📈</span> Mood History
            </h2>
            
            {history.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      domain={[1, 5]} 
                      ticks={[1, 2, 3, 4, 5]}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => getMoodByValue(value).emoji}
                      tick={{ fontSize: 20 }}
                      dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 2, strokeDasharray: '5 5' }} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={4}
                      dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8, fill: '#2563eb', strokeWidth: 0 }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No history data yet.
              </div>
            )}
          </section>
          
          {/* Recent Entries List */}
          {history.length > 0 && (
             <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">📝</span> Recent Notes
              </h2>
              <div className="space-y-4">
                {[...history].reverse().filter(h => h.note).slice(0, 5).map((entry) => {
                  const mood = getMoodByValue(entry.value);
                  return (
                    <div key={entry.id} className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="text-3xl shrink-0">{mood.emoji}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("font-semibold text-sm", mood.text)}>{mood.label}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.fullDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{entry.note}</p>
                      </div>
                    </div>
                  );
                })}
                {[...history].filter(h => h.note).length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">No notes added yet.</p>
                )}
              </div>
             </section>
          )}

        </main>
      </div>
    </div>
  );
}
