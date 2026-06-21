import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../shared/api';
import type { VisitApplication, VisitStatus } from '../../shared/types';
import { statusLabels } from '../../shared/types';

function VisitDetail() {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<VisitApplication | null>(null);
  const [qrInfo, setQrInfo] = useState<{ qrCode: string; expiresAt: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadApplication();
    }
  }, [id]);

  const loadApplication = async () => {
    setLoading(true);
    try {
      const data = await api.getVisitApplication(id!);
      setApplication(data);

      if (data.status === 'approved') {
        const qr = await api.getQRCode(id!);
        setQrInfo(qr);
      }
    } catch (error) {
      console.error('加载申请详情失败', error);
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  if (loading || !application) {
    return <div className="empty-state">加载中...</div>;
  }

  return (
    <div>
      <div className="section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>
            {application.applicantName}
          </div>
          <span className={`status-tag ${application.status}`}>
            {statusLabels[application.status as VisitStatus]}
          </span>
        </div>

        <div style={{ fontSize: '14px', lineHeight: '2', color: '#666' }}>
          <div>
            <span style={{ color: '#999' }}>与老人关系：</span>
            {application.relation}
          </div>
          <div>
            <span style={{ color: '#999' }}>联系电话：</span>
            {application.applicantPhone}
          </div>
          <div>
            <span style={{ color: '#999' }}>探访日期：</span>
            {application.visitDate}
          </div>
          <div>
            <span style={{ color: '#999' }}>探访时段：</span>
            {application.visitTime}
          </div>
          <div>
            <span style={{ color: '#999' }}>探访事由：</span>
            {application.reason || '无'}
          </div>
        </div>
      </div>

      {application.status === 'approved' && qrInfo && (
        <div className="section-card">
          <div className="section-title">探访二维码</div>
          <div className="qr-code-container">
            <div className="qr-label">请在入口处扫码</div>
            <div className="qr-code">
              <div className="qr-pattern" />
            </div>
            <div className="expires-info">
              有效期至：{formatDate(qrInfo.expiresAt)}
            </div>
            <div className="tip">
              请在探访时间内出示此二维码，由工作人员扫码核验后进入。
              二维码仅限本人使用，请勿转发他人。
            </div>
          </div>
        </div>
      )}

      {application.status === 'pending' && (
        <div className="section-card">
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: '#fa8c16',
            fontSize: '14px',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
            <div>申请正在审核中，请耐心等待</div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
              管家将在24小时内完成审核
            </div>
          </div>
        </div>
      )}

      {application.status === 'rejected' && (
        <div className="section-card">
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: '#f5222d',
            fontSize: '14px',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>❌</div>
            <div>申请未通过</div>
            {application.rejectReason && (
              <div style={{ fontSize: '13px', color: '#666', marginTop: '12px' }}>
                拒绝原因：{application.rejectReason}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="section-card">
        <div className="section-title">申请信息</div>
        <div style={{ fontSize: '13px', color: '#999', lineHeight: '2' }}>
          <div>申请时间：{formatDate(application.createdAt)}</div>
          {application.reviewedAt && (
            <div>审核时间：{formatDate(application.reviewedAt)}</div>
          )}
          {application.reviewedBy && (
            <div>审核人：管家</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VisitDetail;
