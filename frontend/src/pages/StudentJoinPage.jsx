import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useToast } from '../context/ToastContext'

export default function StudentJoinPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [rollNo, setRollNo] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!rollNo.trim()) return
    setLoading(true)
    try {
      const res = await api.post(`/student/session/${sessionId}/verify`, { rollNo: rollNo.trim().toUpperCase() })
      navigate(`/session/${sessionId}/view`, { state: { studentData: res.data }, replace: true })
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error('Roll number not found. Check with your APC.')
      } else {
        toast.error(err.response?.data?.error || 'Something went wrong')
      }
    } finally { setLoading(false) }
  }

  return (
    <div style={s.page}>
      <div style={s.bg} />
      <div style={s.glow1} />
      <div style={s.glow2} />

      <div style={s.card} className="card animate-scale">
        <div style={s.header}>
          <div style={s.logoWrap}>
            <div style={s.logo}>IF</div>
          </div>
          <h1 style={s.title}>InterviewFlow</h1>
          <p style={s.subtitle}>Enter your roll number to check in</p>
        </div>

        <form onSubmit={handleVerify} style={s.form}>
          <div>
            <label style={{ textAlign:'center', display:'block' }}>Roll Number</label>
            <input
              className="input input-lg"
              style={{ textAlign:'center', fontFamily:'var(--mono)', fontSize:18, letterSpacing:3 }}
              placeholder="e.g. 2021CS001"
              value={rollNo}
              onChange={e => setRollNo(e.target.value.toUpperCase())}
              autoFocus
              autoCapitalize="characters"
              autoComplete="off"
              required
            />
          </div>

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading || !rollNo.trim()} style={{ width:'100%' }}>
            {loading
              ? <><span className="spinner" style={{ width:16, height:16 }} /> Checking…</>
              : 'Find my spot →'
            }
          </button>
        </form>

        <p style={s.hint}>Your roll number was shared when this drive was set up</p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, position:'relative', overflow:'hidden', background:'var(--bg-0)' },
  bg: { position:'fixed', inset:0, background:'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,107,255,0.10) 0%, transparent 70%)', pointerEvents:'none' },
  glow1: { position:'absolute', top:'20%', left:'20%', width:300, height:300, background:'rgba(124,107,255,0.06)', borderRadius:'50%', filter:'blur(80px)', pointerEvents:'none' },
  glow2: { position:'absolute', bottom:'20%', right:'20%', width:250, height:250, background:'rgba(34,211,160,0.05)', borderRadius:'50%', filter:'blur(60px)', pointerEvents:'none' },
  card: { width:'100%', maxWidth:420, padding:40, position:'relative', zIndex:1 },
  header: { textAlign:'center', marginBottom:32 },
  logoWrap: { display:'flex', justifyContent:'center', marginBottom:16 },
  logo: { width:48, height:48, background:'linear-gradient(135deg, var(--accent), var(--teal))', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:16, color:'#fff', boxShadow:'0 0 24px var(--accent-glow)' },
  title: { fontSize:22, fontWeight:700, marginBottom:6, letterSpacing:'-0.02em' },
  subtitle: { fontSize:14, color:'var(--text-3)' },
  form: { display:'flex', flexDirection:'column', gap:16 },
  hint: { fontSize:12, color:'var(--text-4)', textAlign:'center', marginTop:20 },
}
