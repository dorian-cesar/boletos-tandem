import Select from "react-select";

const customStyles = {
  control: (provided) => ({
    ...provided,
    width: '200px',
    height: '40px',
    borderRadius: '16px',
    background: 'var(--azul-15, #E1E8F4)',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'var(--azul-100, #3365B4)',
    fontFamily: 'Titillium Web',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: 'normal',
  }),
};
const Input = ({ items, selected, setSelected, className, placeholder }) => {
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
      />
    </>
  );
};
export default Input;
