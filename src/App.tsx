import { useState } from 'react'
import { Key, Link as LinkIcon, Trash2, RefreshCw, AlertCircle, Info, CheckCircle2, Loader2, Server, Settings2, Activity } from 'lucide-react'
import './index.css'

function App() {
  const [apiKey, setApiKey] = useState('')
  const [url, setUrl] = useState('')
  const [deployments, setDeployments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [accountId, setAccountId] = useState('')
  const [projectName, setProjectName] = useState('')
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info')

  const extractInfo = (inputUrl: string) => {
    try {
      const parsed = new URL(inputUrl)
      const parts = parsed.pathname.split('/').filter(Boolean)
      if (parsed.hostname === 'dash.cloudflare.com' && parts.length >= 4 && parts[1] === 'pages' && parts[2] === 'view') {
        return { account: parts[0], project: parts[3] }
      }
    } catch (e) {
      // Ignore
    }
    return null
  }

  const fetchDeployments = async () => {
    setError('')
    setDeployments([])
    setStatus('')
    
    const info = extractInfo(url)
    if (!info) {
      setError('Invalid URL format. Please use https://dash.cloudflare.com/<ACCOUNT_ID>/pages/view/<PROJECT_NAME>')
      return
    }

    if (!apiKey) {
      setError('Please enter an API Key.')
      return
    }

    setAccountId(info.account)
    setProjectName(info.project)
    setLoading(true)
    setStatusType('info')

    try {
      let allDeployments: any[] = []
      let page = 1
      let hasMore = true

      setStatus('Fetching deployments...')

      while (hasMore) {
        const response = await fetch(`/api/accounts/${info.account}/pages/projects/${info.project}/deployments?page=${page}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        })
        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.errors?.[0]?.message || 'Failed to fetch deployments')
        }

        if (data.result && data.result.length > 0) {
          allDeployments = [...allDeployments, ...data.result]
          setStatus(`Fetched ${allDeployments.length} deployments...`)
          page++
        } else {
          hasMore = false
        }
      }

      setDeployments(allDeployments)
      setStatus(`Successfully fetched all ${allDeployments.length} deployments.`)
      setStatusType('success')
    } catch (err: any) {
      setError(err.message)
      setStatus('')
    } finally {
      setLoading(false)
    }
  }

  const deleteDeployments = async () => {
    if (!confirm(`Are you sure you want to delete ${deployments.length} deployments for project ${projectName}?`)) {
      return
    }

    setLoading(true)
    setError('')
    setStatusType('info')
    setStatus(`Deleting 0 / ${deployments.length}...`)

    let deleted = 0
    let failed = 0

    for (let i = 0; i < deployments.length; i++) {
      const dep = deployments[i]
      try {
        const response = await fetch(`/api/accounts/${accountId}/pages/projects/${projectName}/deployments/${dep.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        })
        const data = await response.json()
        if (response.ok && (data.success || data.result === null)) { 
          deleted++
        } else {
          failed++
        }
      } catch (e) {
        failed++
      }

      if ((i + 1) % 5 === 0 || i === deployments.length - 1) {
        setStatus(`Deleting... ${deleted} deleted, ${failed} failed. (${i + 1}/${deployments.length})`)
      }
    }

    setStatus(`Finished! ${deleted} deleted, ${failed} failed.`)
    setStatusType(failed > 0 ? 'error' : 'success')
    setLoading(false)
    
    // Refresh list to show what's left
    fetchDeployments()
  }

  return (
    <div className="app-wrapper">
      <nav className="top-nav">
        <div className="nav-content">
          <div className="nav-logo">
            <Server size={18} className="logo-icon" />
            <span>Cloudflare Bulk Deployment Delete</span>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <header className="page-header">
          <h1>Cloudflare Bulk Deployment Delete</h1>
          <p>Bulk-delete old Cloudflare Pages deployments to keep your environments tidy.</p>
        </header>

        <section className="section">
          <div className="section-header">
            <Settings2 size={16} />
            <h2>Configuration</h2>
          </div>
          
          <div className="card">
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Cloudflare API Token</label>
                  <div className="input-wrapper">
                    <Key size={16} className="input-icon" />
                    <input 
                      type="password" 
                      value={apiKey} 
                      onChange={e => setApiKey(e.target.value)} 
                      placeholder="Paste your token..." 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Dashboard URL</label>
                  <div className="input-wrapper">
                    <LinkIcon size={16} className="input-icon" />
                    <input 
                      type="text" 
                      value={url} 
                      onChange={e => setUrl(e.target.value)} 
                      placeholder="https://dash.cloudflare.com/ACCOUNT_ID/pages/view/PROJECT_NAME" 
                    />
                  </div>
                </div>
              </div>

              <div className="alert alert-info">
                <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  Requires a Custom API Token with <strong>Account &rarr; Cloudflare Pages &rarr; Edit</strong> permissions.
                </div>
              </div>

              {error && (
                <div className="alert alert-error">
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>{error}</div>
                </div>
              )}
            </div>
            <div className="card-footer">
              <button className="btn btn-primary" onClick={fetchDeployments} disabled={loading || !url || !apiKey}>
                {loading && !status.includes('Deleting') ? <Loader2 size={16} className="spinner" /> : <RefreshCw size={16} />}
                Fetch Deployments
              </button>
            </div>
          </div>
        </section>

        {(status || deployments.length > 0) && (
          <section className="section">
            <div className="section-header">
              <Activity size={16} />
              <h2>Results</h2>
            </div>
            
            {status && (
              <div className={`alert alert-${statusType}`} style={{ marginBottom: '24px', marginTop: 0 }}>
                {statusType === 'error' && <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />}
                {statusType === 'success' && <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />}
                {statusType === 'info' && <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />}
                <div>{status}</div>
              </div>
            )}

            {deployments.length > 0 && (
              <>
                <div className="results-meta">
                  <h3>{deployments.length} Deployments Found</h3>
                  <button className="btn btn-danger" onClick={deleteDeployments} disabled={loading}>
                    {loading && status.includes('Deleting') ? <Loader2 size={16} className="spinner" /> : <Trash2 size={16} />}
                    Delete All
                  </button>
                </div>
                
                <div className="list-container">
                  {deployments.map(d => (
                    <div key={d.id} className="list-item">
                      <div className="item-main">
                        <span className="item-id">{d.id.slice(0, 8)}</span>
                        <span className="item-date">
                          {new Date(d.created_on).toLocaleString(undefined, { 
                            dateStyle: 'medium', 
                            timeStyle: 'short' 
                          })}
                        </span>
                      </div>
                      <span className={`badge ${d.environment === 'production' ? 'production' : 'preview'}`}>
                        {d.environment}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default App
