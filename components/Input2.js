  import { useId } from 'react';

  import Select from "react-select";


  const customStyles = {
    control: (provided) => ({
      ...provided,
      width: '100%',
      height: '40px',
      borderRadius: '16px',
      border: '1px solid var(--azul-50, #98B1D9)',
      background: 'var(--Blanco, #FFF)',
      color: 'var(--gris-50, #7F7F7F)',
    }),

    placeholder: (provided) => ({
      ...provided,
      color: 'var(--gris-50, #7F7F7F)',
      fontFamily: 'Titillium Web',
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: 'normal',
    }),
    classNames: (provided) => ({
      ...provided,
      
    }),
  };
  const Input2 = ({ items, selected, setSelected, className, placeholder, isDisabled }) => {
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
          instanceId={useId()}
          isDisabled={ isDisabled }
        />
      </>
    );
  };
  export default Input2;


