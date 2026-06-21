import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd-mobile';
import { api } from '../../shared/api';
import type { FamilyMember } from '../../shared/types';
import { permissionLabels, relationLabels } from '../../shared/types';

const ELDERLY_ID = 'e001';

function FamilyList() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const data = await api.getFamilyMembers(ELDERLY_ID);
      setMembers(data);
    } catch (error) {
      console.error('加载家属列表失败', error);
    }
  };

  return (
    <div>
      <div className="section-card">
        <div className="section-title">
          家属列表
          <span className="more" style={{ color: '#1890ff' }} onClick={() => {}}>
            + 添加
          </span>
        </div>

        {members.length === 0 ? (
          <div className="empty-state">暂无家属成员</div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="family-member-item"
              onClick={() => navigate(`/permission/${member.id}`)}
            >
              <div className="avatar">👤</div>
              <div className="info">
                <div className="name-row">
                  <span className="name">{member.name}</span>
                  <span className="relation">
                    {member.relationLabel || relationLabels[member.relation]}
                  </span>
                  {member.isPrimary && <span className="primary-tag">主要家属</span>}
                </div>
                <div className="permissions">
                  权限：
                  {member.permissions
                    .map((p) => permissionLabels[p])
                    .join('、') || '无'}
                </div>
              </div>
              <div className="arrow">›</div>
            </div>
          ))
        )}
      </div>

      <div className="section-card">
        <div className="section-title">说明</div>
        <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.8' }}>
          <p>• 主要家属拥有全部权限且不可删除</p>
          <p>• 权限变更操作会记录在审计日志中</p>
          <p>• 可查看权限变更的操作人和时间</p>
        </div>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <Button
          block
          color="default"
          onClick={() => navigate('/audit')}
        >
          查看权限变更记录
        </Button>
      </div>
    </div>
  );
}

export default FamilyList;
