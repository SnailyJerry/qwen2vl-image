import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [image, setImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // 处理图片上传
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // 处理文本输入
  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  // 提交表单，发送请求
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!image || !prompt) {
      alert('请上传图片并输入提示!');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);
    formData.append('prompt', prompt);

    setLoading(true);

    try {
      const response = await axios.post('/api/describe-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setDescription(response.data.description);
    } catch (error) {
      console.error('Error describing image:', error);
      alert('图片描述请求失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>图片描述生成</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <input
          type="text"
          placeholder="输入提示..."
          value={prompt}
          onChange={handlePromptChange}
        />
        <button type="submit">生成描述</button>
      </form>
      {loading && <p>正在生成描述...</p>}
      {description && (
        <div>
          <h2>图片描述</h2>
          <p>{description}</p>
        </div>
      )}
    </div>
  );
}

export default App;
