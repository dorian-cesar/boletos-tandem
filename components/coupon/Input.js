import Select from "react-select";
import styles from './input.module.css'

const customStyles = {
  control: (provided) => ({
    ...provided,
    display: 'flex', 
    // width: '320px',
    height: '60px',
    padding: '8px', 
    borderRadius: '16px',
    gap: '10px', 
    background: 'var(--Blanco, #FFF)', 
    flex: '1 0 100%',
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
        className={styles["sel-input"]}
      />
    </>
  );
};
export default Input;
