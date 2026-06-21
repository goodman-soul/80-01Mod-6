import { useState, useEffect } from 'react';
import { Input, Button, Dialog, Toast } from 'antd-mobile';
import { api } from '../../shared/api';
import type { FamilyMessage, FollowUpItem } from '../../shared/types';
import { categoryLabels } from '../../shared/types';

const ELDERLY_ID = 'e001';
const FAMILY_MEMBER_ID = 'fm001';
const FAMILY_MEMBER_NAME = '张伟';

function MessageList() {
  const [messages, setMessages] = useState<FamilyMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [followUpItems, setFollowUpItems] = useState<FollowUpItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const msgs = await api.getMessages(ELDERLY_ID);
      setMessages(msgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      const items = await api.getFollowUpItems(ELDERLY_ID);
      setFollowUpItems(items);
    } catch (error) {
      console.error('加载数据失败', error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) {
      Toast.show('请输入留言内容');
      return;
    }

    setSending(true);
    try {
      const result = await api.addMessage(ELDERLY_ID, {
        familyMemberId: FAMILY_MEMBER_ID,
        familyMemberName: FAMILY_MEMBER_NAME,
        content: newMessage.trim(),
      });

      if (result.followUpItem) {
        const categoryName = categoryLabels[result.followUpItem.category];
        Dialog.alert({
          title: '已生成跟进事项',
          content: `您的留言中包含「${categoryName}」相关内容，已自动生成一条跟进事项，管家会尽快处理。`,
        });
      } else {
        Toast.show('留言发送成功');
      }

      setNewMessage('');
      await loadData();
    } catch (error) {
      Toast.show('发送失败');
    }
    setSending(false);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (days === 1) {
      return '昨天';
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  return (
    <div>
      {followUpItems.length > 0 && (
        <div className="section-card">
          <div className="section-title">
            跟进事项
            <span className="more" style={{ color: '#f5222d' }}>
              {followUpItems.filter((i) => i.status !== 'resolved').length} 条待处理
            </span>
          </div>
          {followUpItems
            .filter((item) => item.status !== 'resolved')
            .slice(0, 3)
            .map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.title}</span>
                  <span className={`category-tag ${item.category}`}>
                    {categoryLabels[item.category]}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  状态：{item.status === 'pending' ? '待处理' : item.status === 'processing' ? '处理中' : '已解决'}
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="section-card">
        <div className="section-title">家属留言</div>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {messages.length === 0 ? (
            <div className="empty-state">暂无留言</div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="message-item">
                <div className="message-header">
                  <span className="from">{msg.familyMemberName}</span>
                  <span className="time">{formatTime(msg.createdAt)}</span>
                </div>
                <div className="message-content">{msg.content}</div>
                {msg.category !== 'normal' && (
                  <span className={`category-tag ${msg.category}`}>
                    {categoryLabels[msg.category]} · 已生成跟进事项
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="section-card">
        <div className="section-title">我要留言</div>
        <Input
          placeholder="请输入留言内容..."
          value={newMessage}
          onChange={(val: string) => setNewMessage(val)}
          style={{ marginBottom: '12px' }}
        />
        <div style={{ fontSize: '12px', color: '#999', marginBottom: '12px' }}>
          提示：留言中如提到跌倒、情绪低落、投诉等内容，会自动生成跟进事项
        </div>
        <Button
          block
          color="primary"
          onClick={handleSend}
          loading={sending}
        >
          发送
        </Button>
      </div>
    </div>
  );
}

export default MessageList;
