import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Picker, DatePicker, TextArea, Toast, Dialog } from 'antd-mobile';
import { api } from '../../shared/api';

const ELDERLY_ID = 'e001';

function VisitApply() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');

  const relationColumns = [
    [
      { label: '子女', value: '子女' },
      { label: '配偶', value: '配偶' },
      { label: '孙辈', value: '孙辈' },
      { label: '兄弟姐妹', value: '兄弟姐妹' },
      { label: '朋友', value: '朋友' },
      { label: '其他', value: '其他' },
    ],
  ];

  const timeColumns = [
    [
      { label: '09:00-10:00', value: '09:00-10:00' },
      { label: '10:00-11:00', value: '10:00-11:00' },
      { label: '14:00-15:00', value: '14:00-15:00' },
      { label: '15:00-16:00', value: '15:00-16:00' },
      { label: '16:00-17:00', value: '16:00-17:00' },
    ],
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!visitDate) {
        Toast.show('请选择探访日期');
        return;
      }
      if (!visitTime) {
        Toast.show('请选择探访时段');
        return;
      }

      setLoading(true);

      await api.createVisitApplication({
        elderlyId: ELDERLY_ID,
        applicantName: values.applicantName,
        applicantPhone: values.applicantPhone,
        relation: values.relation?.[0] || '',
        visitDate,
        visitTime,
        reason: values.reason || '',
      });

      Dialog.alert({
        title: '申请已提交',
        content: '您的探访申请已提交，请等待管家审核。审核通过后将生成探访二维码。',
        onConfirm: () => {
          navigate('/visit/list');
        },
      });
    } catch (error) {
      if ((error as Error).message !== '用户取消') {
        Toast.show((error as Error).message || '提交失败');
      }
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="section-card">
        <div className="section-title">探访信息</div>
        <Form
          form={form}
          layout="horizontal"
          mode="card"
          initialValues={{ relation: ['子女'] }}
        >
          <Form.Item
            label="申请人"
            name="applicantName"
            rules={[{ required: true, message: '请输入申请人姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            label="手机号"
            name="applicantPhone"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" type="tel" />
          </Form.Item>

          <Form.Item label="与老人关系" name="relation">
            <Picker
              columns={relationColumns}
              onConfirm={(val) => form.setFieldValue('relation', val)}
            >
              {(items) => (
                <div style={{ color: '#333' }}>
                  {items[0]?.label || '请选择'}
                </div>
              )}
            </Picker>
          </Form.Item>
        </Form>
      </div>

      <div className="section-card">
        <div className="section-title">探访时间</div>
        <div
          style={{
            padding: '12px 0',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onClick={() => setShowDatePicker(true)}
        >
          <span style={{ color: '#999' }}>探访日期</span>
          <span style={{ color: visitDate ? '#333' : '#ccc' }}>
            {visitDate || '请选择'}
          </span>
        </div>
        <div
          style={{
            padding: '12px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onClick={() => setShowTimePicker(true)}
        >
          <span style={{ color: '#999' }}>探访时段</span>
          <span style={{ color: visitTime ? '#333' : '#ccc' }}>
            {visitTime || '请选择'}
          </span>
        </div>
      </div>

      <div className="section-card">
        <div className="section-title">探访事由</div>
        <Form form={form} layout="horizontal" mode="card">
          <Form.Item name="reason">
            <TextArea
              placeholder="请输入探访事由（选填）"
              rows={3}
            />
          </Form.Item>
        </Form>
      </div>

      <div className="section-card">
        <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
          <p>📌 温馨提示：</p>
          <p>• 探访申请需经管家审核通过后方可进入</p>
          <p>• 审核通过后将生成专属探访二维码</p>
          <p>• 请在预约时间内到访，逾期二维码失效</p>
          <p>• 每位老人每日探访人数不超过2人</p>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <Button
          block
          color="primary"
          onClick={handleSubmit}
          loading={loading}
        >
          提交申请
        </Button>
      </div>

      <DatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={(val: Date) => {
          const dateStr = `${val.getFullYear()}-${(val.getMonth() + 1).toString().padStart(2, '0')}-${val.getDate().toString().padStart(2, '0')}`;
          setVisitDate(dateStr);
        }}
        min={new Date()}
        max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
      />

      <Picker
        visible={showTimePicker}
        columns={timeColumns}
        onClose={() => setShowTimePicker(false)}
        onConfirm={(val) => setVisitTime(val[0] as string)}
        title="选择探访时段"
      />
    </div>
  );
}

export default VisitApply;
