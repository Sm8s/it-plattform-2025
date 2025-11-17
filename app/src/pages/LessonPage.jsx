import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

function MarkdownRenderer({ content }) {
  // Mini Renderer: ersetzt nur Zeilenumbrüche.
  return <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{content}</div>;
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
