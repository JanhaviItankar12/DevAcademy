import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const RichTextEditor = ({ value, setValue }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose max-w-none min-h-[200px] border p-4 rounded-lg focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      setValue(editor.getHTML());
    },
  });

  return <EditorContent editor={editor} />;
};

export default RichTextEditor;

