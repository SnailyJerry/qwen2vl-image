import multer from 'multer';
import axios from 'axios';
import { IncomingForm } from 'formidable';

// 使用 multer 处理图片上传
export const config = {
  api: {
    bodyParser: false,
  },
};

// 使用 formidable 处理多部分表单数据
const upload = new IncomingForm();

export default async function handler(req, res) {
  // 处理 POST 请求
  if (req.method === 'POST') {
    upload.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: '文件上传失败' });
      }
      
      const prompt = fields.prompt;
      const image = files.image;

      // 如果没有图片或提示，返回错误
      if (!image || !prompt) {
        return res.status(400).json({ error: '图片和提示不能为空' });
      }

      try {
        const fs = require('fs');
        const imageBuffer = fs.readFileSync(image.filepath);
        const base64Image = Buffer.from(imageBuffer).toString('base64');

        // 调用通义千问VL API
        const response = await axios.post(
          'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
          {
            model: 'qwen-vl-max',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Image}`,
                    },
                  },
                  {
                    type: 'text',
                    text: prompt,
                  },
                ],
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const description = response.data.choices[0].message.content;
        res.status(200).json({ description });
      } catch (error) {
        console.error('API调用失败', error);
        res.status(500).json({ error: '图片描述失败' });
      }
    });
  } else {
    res.status(405).json({ error: '只允许 POST 请求' });
  }
}
