import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs } from 'antd-mobile';
import { api } from '../../shared/api';
import type { VisitApplication, VisitStatus } from '../../shared/types';
import { statusLabels } from '../../shared/types';

const ELDERLY_ID = 'e001';

function VisitList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [applications, setApplications] = useState<VisitApplication[]>([]);

  useEffect(() => {
    loadApplications(activeTab === 'all' ? undefined : activeTab);
  }, [activeTab]);

  const loadApplications = async (status?: string) => {
    try {
      const data = await api.getVisitApplications(ELDERLY_ID, status === 'all' ? undefined : status);
      setApplications(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('加载探访申请失败', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const tabs = [
    { key: 'all', title: '全部' },
    { key: 'pending', title: '待审核' },
    { key: 'approved', title: '已通过' },
    { key: 'rejected', title: '已拒绝' },
  ];

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ background: 'white' }}
      >
        {tabs.map((tab) => (
          <Tabs.Tab title={tab.title} key={tab.key} />
        ))}
      </Tabs>

      <div style={{ padding: '12px' }}>
        {applications.length === 0 ? (
          <div className="empty-state">暂无探访申请</div>
        ) : (
          <div className="section-card" style={{ margin: 0 }}>
            {applications.map((app) => (
              <div
                key={app.id}
                className="visit-item"
                onClick={() => navigate(`/visit/${app.id}`)}
              >
                <div className="visit-header">
                  <span className="applicant">{app.applicantName}</span>
                  <span className={`status-tag ${app.status}`}>
                    {statusLabels[app.status as VisitStatus]}
                  </span>
                </div>
                <div className="visit-detail">
                  <div>
                    <span className="label">关系：</span>{app.relation}
                  </div>
                  <div>
                    <span className="label">探访时间：</span>
                    {app.visitDate} {app.visitTime}
                  </div>
                  <div>
                    <span className="label">申请时间：</span>
                    {formatDate(app.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px', background: 'white', maxWidth: '750px', margin: '0 auto' }}>
        <button
          style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/visit/apply')}
        >
          申请探访
        </button>
      </div>
    </div>
  );
}

export default VisitList;
