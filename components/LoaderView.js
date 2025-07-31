const Loader = ({ loading, text = "Cargando...", className = "" }) => {
  if (!loading) return null;

  return (
    <div className={`embedded-loader ${className}`}>
      <div className="spinner-border text-primary" role="status" />
      <p className="text-primary mt-2 small">{text}</p>
    </div>
  );
};

export default Loader;