import React, { useState } from 'react';
import { Input, Modal, Button } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';

interface ExpandableInputProps {
    value: string;
    onChange: (value: string) => void;
}

export const ExpandableInput: React.FC<ExpandableInputProps> = ({ value, onChange }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    return (
        <>
            <Input
                value={value}
                onChange={e => onChange(e.target.value)}
                suffix={
                    <Button type="text" onClick={showModal}>
                        <ExpandOutlined />
                    </Button>
                }
            />

            <Modal
                title="Input Modal"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                width="80vw"
                style={{ top: 0, padding: 0 }}
                bodyStyle={{ height: "80vh" }}
            >
                <Input.TextArea placeholder={value} onChange={handleInputChange} autoSize={{ minRows: 25, maxRows: 6 }} style={{ width: '100%', height: '100%', marginTop: 10, marginBottom: 10 }} />
                {/* <TextArea
                                placeholder={key}
                                
                                onChange={e => handleInputParamValChange(key, e.target.value)}
                            /> */}

            </Modal>
        </>
    );
}