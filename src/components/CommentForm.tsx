import React, { useState } from 'react';

interface CommentFormProps {
  onAdd: (text: string) => void;
  placeholder?: string;
  sendLabel?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({ onAdd, placeholder = 'Ajouter un commentaire...', sendLabel = 'Envoyer' }) => {
  const [text, setText] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      setText('');
    }
  };
  return (
    <form className="flex items-start gap-4 mb-0" onSubmit={handleSubmit}>
      <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Votre avatar" className="w-12 h-12 rounded-full object-cover mt-1" />
      <div className="flex-1">
        <textarea
          className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-[#ff184e] focus:ring-2 focus:ring-[#ff184e] transition mb-2 resize-none text-base"
          rows={3}
          placeholder={placeholder}
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div className="flex justify-end">
          <button type="submit" className="bg-[#ff184e] hover:bg-red-600 text-white px-6 py-2 rounded-xl font-semibold shadow transition-all">
            {sendLabel}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm; 