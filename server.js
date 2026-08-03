import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/api/chat', async (req, res) => {
    try {
        const { mensaje, materia } = req.body;

        if (!mensaje) {
            return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
        }

        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'No se encontró la GROQ_API_KEY en el archivo .env' });
        }

        const systemPrompt = `Eres MentorIA, un tutor académico experto en ${materia || 'General'}. Responde de forma didáctica, amigable y estructurada utilizando formato Markdown.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: mensaje }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error reportado por Groq:', data);
            return res.status(response.status).json({ 
                error: data.error?.message || 'Error al comunicarse con la API de Groq.' 
            });
        }

        const respuestaIA = data.choices?.[0]?.message?.content || 'No se recibió respuesta del tutor.';
        res.json({ respuesta: respuestaIA });

    } catch (error) {
        console.error('Error en el servidor:', error.message);
        res.status(500).json({ 
            error: `Error interno del servidor: ${error.message}` 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor de MentorIA corriendo en http://localhost:${PORT}`);
});