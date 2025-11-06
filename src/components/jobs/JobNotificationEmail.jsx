import React from "react";

export default function JobNotificationEmail({ job, company, aiSummary, jobUrl }) {
  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {/* Header with logo */}
      <div style={{ 
        textAlign: 'center', 
        padding: '32px 24px 24px',
        backgroundColor: '#f8fafc'
      }}>
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/291ea5029_TalentStackCorporateImages-1.png"
          alt="Talent Stack"
          style={{
            width: '64px',
            height: '64px',
            margin: '0 auto',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}
        />
        <h1 style={{
          margin: '16px 0 0',
          fontSize: '24px',
          fontWeight: '700',
          color: '#1e293b'
        }}>
          Talent Stack
        </h1>
      </div>

      {/* Main content */}
      <div style={{ padding: '32px 24px' }}>
        <h2 style={{
          margin: '0 0 16px',
          fontSize: '24px',
          fontWeight: '600',
          color: '#1e293b',
          lineHeight: '1.3'
        }}>
          🎯 New Job Opportunity Available
        </h2>

        <p style={{
          margin: '0 0 24px',
          fontSize: '16px',
          color: '#64748b',
          lineHeight: '1.5'
        }}>
          A new position has been posted that might interest your network.
        </p>

        {/* Job details card */}
        <div style={{
          backgroundColor: '#f1f5f9',
          borderRadius: '8px',
          padding: '20px',
          margin: '0 0 24px'
        }}>
          <h3 style={{
            margin: '0 0 8px',
            fontSize: '20px',
            fontWeight: '600',
            color: '#1e293b'
          }}>
            {job.title}
          </h3>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            margin: '0 0 16px',
            fontSize: '14px',
            color: '#64748b'
          }}>
            {company && <span>🏢 {company.name}</span>}
            {job.location && <span>📍 {job.location}</span>}
            {job.remote_type && <span>💻 {job.remote_type}</span>}
            {(job.salary_min || job.salary_max) && (
              <span>💰 {job.salary_min ? `$${job.salary_min.toLocaleString()}` : ''}{job.salary_min && job.salary_max ? ' - ' : ''}{job.salary_max ? `$${job.salary_max.toLocaleString()}` : ''}</span>
            )}
          </div>

          {aiSummary && (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              padding: '16px',
              border: '1px solid #e2e8f0',
              margin: '0 0 16px'
            }}>
              <p style={{
                margin: '0 0 8px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#0084ff',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                AI Summary
              </p>
              <p style={{
                margin: '0',
                fontSize: '14px',
                color: '#374151',
                lineHeight: '1.4'
              }}>
                {aiSummary}
              </p>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div style={{ textAlign: 'center', margin: '0 0 32px' }}>
          <a
            href={jobUrl}
            style={{
              display: 'inline-block',
              backgroundColor: '#0084ff',
              color: '#ffffff',
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              borderRadius: '8px',
              border: 'none'
            }}
          >
            View Job Details
          </a>
        </div>

        <p style={{
          margin: '0 0 16px',
          fontSize: '14px',
          color: '#64748b',
          lineHeight: '1.5'
        }}>
          Share this opportunity with qualified candidates in your network. The best placements often come from personal recommendations.
        </p>

        <p style={{
          margin: '0',
          fontSize: '14px',
          color: '#64748b'
        }}>
          Reply to this email if you have any questions or need additional details.
        </p>

        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb',
          fontSize: '12px',
          color: '#9ca3af',
          textAlign: 'center'
        }}>
          Thank you for being part of the Talent Stack team!
        </div>
      </div>
    </div>
  );
}