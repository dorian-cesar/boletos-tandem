import Select from "react-select";

const customStyles = {
  control: (provided) => ({
    ...provided,
    display: 'flex', 
    width: '100%',
    height: '100%',
    padding: '8px', 
    borderRadius: '16px',
    gap: '10px', 
    background: 'var(--Blanco, #FFF)', 
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'var(--gris-50, #7F7F7F)',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: 'normal',
  }),
};
const Input = ({ items, selected, setSelected, className, placeholder, isDisabled }) => {
  return (
    <>
      {" "}
      <Select
        value={selected}
        styles={customStyles}
        placeholder={placeholder}
        options={items}
        onChange={(e, a) => {
          setSelected(e.value);
        }}
        isDisabled={isDisabled} 
      />
    </>
  );
};
export default Input;
