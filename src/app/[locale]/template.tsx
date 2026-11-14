// A template (unlike a layout) is re-created on every navigation, so each page
// arrives with the same short settle. See .page-arrive in globals.css.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-arrive">{children}</div>;
}
