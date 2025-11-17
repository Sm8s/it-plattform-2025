import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

function MarkdownRenderer({ content }) {
  return <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{content}</div>;
}

function CodeExercise({ starterCode }) {
  const [code, setCode] = useState(starterCode || '<h1>Hello World</h1>');
  const [previewKey, setPreviewKey] = useState(0);

  const runCode = () => {
    setPreviewKey(prev => prev + 1);
  };

  return (
    <section style={{ marginTop: '2rem' }}>
      <h3>Interaktive Übung</h3>
      <p style={{ fontSize: '.85rem', opacity: .85, marginBottom: '.5rem' }}>
        Schreibe deinen Code links und klicke auf "Ausführen", um das Ergebnis rechts zu sehen.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ fontSize: '.8rem', marginBottom: '.3rem' }}>Editor</div>
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            style={{
              width: '100%',
              minHeight: '260px',
              borderRadius: '.8rem',
              border: '1px solid rgba(148,163,184,0.6)',
              background: 'rgba(15,23,42,0.95)',
              color: '#e5e7eb',
              fontFamily: 'monospace',
              fontSize: '.8rem',
              padding: '.7rem'
            }}
          />
          <button
            className="btn btn-primary"
            type="button"
            onClick={runCode}
            style={{ marginTop: '.6rem' }}
          >
            Ausführen
          </button>
        </div>
        <div>
          <div style={{ fontSize: '.8rem', marginBottom: '.3rem' }}>Preview</div>
          <div
            style={{
              borderRadius: '.8rem',
              overflow: 'hidden',
              border: '1px solid rgba(148,163,184,0.6)',
              background: '#fff'
            }}
          >
            <iframe
              key={previewKey}
              title="preview"
              style={{ width: '100%', height: '260px', border: 'none' }}
              srcDoc={code}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LessonPage() {
  const { slug, lessonId } = useParams();
  const { locale, session } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .maybeSingle();
      setLesson(lessonData);

      if (lessonData) {
        const { data: quiz } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('lesson_id', lessonData.id);
        setQuizQuestions(quiz || []);
      }
    };
    load();
  }, [lessonId]);

  const handleSubmitQuiz = async () => {
    let correct = 0;
    quizQuestions.forEach(q => {
      if (answers[q.id] === q.correct_option_id) correct++;
    });
    const score = quizQuestions.length ? Math.round((correct / quizQuestions.length) * 100) : 0;
    setResult({ correct, total: quizQuestions.length, score });

    if (!session) return;
    await supabase.from('lesson_progress').upsert({
      user_id: session.user.id,
      lesson_id: lessonId,
      status: 'completed',
      score,
      completed_at: new Date().toISOString()
    });
    await supabase.from('gamification_events').insert({
      user_id: session.user.id,
      type: 'lesson_completed',
      xp_delta: 50,
      meta: { slug, lessonId }
    });
  };

  if (!lesson) return <main className="section">Lektion wird geladen…</main>;

  const title = locale === 'de' ? lesson.title_de : lesson.title_en;
  const content = locale === 'de' ? lesson.content_md_de : lesson.content_md_en;

  return (
    <main className="section">
      <h2>{title}</h2>
      <MarkdownRenderer content={content || "Noch kein Inhalt hinterlegt."} />

      {lesson.exercise_type === 'code' && (
        <CodeExercise starterCode={lesson.starter_code} />
      )}

      {quizQuestions.length > 0 && (
        <section style={{ marginTop: '2rem' }}>
          <h3>Quiz</h3>
          {quizQuestions.map(q => {
            const question = locale === 'de' ? q.question_de : q.question_en;
            const options = q.options || [];
            return (
              <div key={q.id} style={{ marginBottom: '1rem' }}>
                <p>{question}</p>
                {options.map(opt => {
                  const text = locale === 'de' ? opt.text_de : opt.text_en;
                  return (
                    <label
                      key={opt.id}
                      style={{ display: 'block', fontSize: '.9rem', cursor: 'pointer' }}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt.id}
                        onChange={() =>
                          setAnswers(prev => ({
                            ...prev,
                            [q.id]: opt.id
                          }))
                        }
                        checked={answers[q.id] === opt.id}
                        style={{ marginRight: '.4rem' }}
                      />
                      {text}
                    </label>
                  );
                })}
              </div>
            );
          })}
          <button className="btn btn-primary" onClick={handleSubmitQuiz}>
            Quiz auswerten
          </button>
          {result && (
            <p style={{ marginTop: '1rem' }}>
              Du hast {result.correct} von {result.total} Fragen richtig ({result.score}%)
            </p>
          )}
        </section>
      )}
    </main>
  );
}
