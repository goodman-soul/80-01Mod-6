import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckList, Button, TextArea, Dialog, Toast } from 'antd-mobile';
import { api } from '../../shared/api';
import type { FamilyMember, PermissionType } from '../../shared/types';
import { relationLabels } from '../../shared/types';

const OPERATOR_ID = 'fm001';
const OPERATOR_NAME = '张伟';

function PermissionEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [permissions, setPermissions] = useState<PermissionType[]>([]);
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadMember();
    }
  }, [id]);

  const loadMember = async () => {
    try {
      const data = await api.getFamilyMember(id!);
      setMember(data);
      setPermissions(data.permissions);
    } catch (error) {
      console.error('加载家属信息失败', error);
    }
  };

  const handleSave = async () => {
    if (!member) return;

    if (permissions.length === member.permissions.length &&
        permissions.every((p) => member.permissions.includes(p))) {
      Toast.show('权限未发生变化');
      return;
    }

    const result = await Dialog.confirm({
      title: '确认修改',
      content: '修改权限后会在审计日志中留痕，请确认操作',
    });

    if (!result) return;

    setLoading(true);
    try {
      await api.updatePermissions(id!, {
        permissions,
        operatorId: OPERATOR_ID,
        operatorName: OPERATOR_NAME,
        remark: remark || undefined,
      });
      Toast.show('权限修改成功');
      navigate(-1);
    } catch (error) {
      Dialog.alert({
        title: '修改失败',
        content: (error as Error).message,
      });
    }
    setLoading(false);
  };

  if (!member) {
    return <div className="empty-state">加载中...</div>;
  }

  const permissionOptions: { value: PermissionType; label: string }[] = [
    { value: 'service_records', label: '服务记录' },
    { value: 'health_reminders', label: '健康提醒' },
    { value: 'photos', label: '照片' },
  ];

  return (
    <div>
      <div className="section-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: '#e6f7ff', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '24px'
          }}>
            👤
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
              {member.name}
            </div>
            <div style={{ fontSize: '13px', color: '#999' }}>
              {member.relationLabel || relationLabels[member.relation]}
              {member.isPrimary && ' · 主要家属'}
            </div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-title">可见内容权限</div>
        <CheckList
          value={permissions}
          onChange={(val) => setPermissions(val as PermissionType[])}
          multiple
        >
          {permissionOptions.map((opt) => (
            <CheckList.Item key={opt.value} value={opt.value}>
              {opt.label}
            </CheckList.Item>
          ))}
        </CheckList>
      </div>

      <div className="section-card">
        <div className="section-title">变更原因（可选）</div>
        <TextArea
          placeholder="请输入权限变更的原因..."
          value={remark}
          onChange={(val: string) => setRemark(val)}
          rows={3}
        />
      </div>

      <div className="section-card">
        <div style={{ fontSize: '13px', color: '#fa8c16', lineHeight: '1.6' }}>
          ⚠️ 权限变更会记录在审计日志中，包括操作人、操作时间、变更前后的权限以及变更原因。
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <Button
          block
          color="primary"
          onClick={handleSave}
          loading={loading}
          disabled={member.isPrimary}
        >
          {member.isPrimary ? '主要家属权限不可修改' : '保存修改'}
        </Button>
      </div>
    </div>
  );
}

export default PermissionEdit;
