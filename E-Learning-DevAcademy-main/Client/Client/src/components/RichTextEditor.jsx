import React, { useRef } from 'react';
import JoditEditor from 'jodit-react';

const RichTextEditor = ({ input, setInput }) => {
  const editor = useRef(null);

  return (
    <div className="border rounded">
      <JoditEditor
        ref={editor}
        value={input.description || ''}
        onBlur={(newContent) => 
          setInput((prev) => ({ ...prev, description: newContent }))
        }
        config={{
          readonly: false,
          placeholder: 'Enter course description...',
          height: 400,
          toolbarSticky: false,
          uploader: { insertImageAsBase64URI: true },
          buttons: [
            'bold', 'italic', 'underline', '|',
            'ul', 'ol', '|', 'link', 'image', 'video', '|',
            'undo', 'redo', 'fullsize'
          ],
        }}
      />
    </div>
  );
};

export default RichTextEditor;
