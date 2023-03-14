import Select from 'react-select'
const Input = ({items, selected, setSelected, className, placeholder}) =>{
    
      return ( <> <Select value={selected} classNamePrefix="react-select"  className={className} placeholder={placeholder} options={items} onChange={(e,a)=>{
        setSelected(e.value)
      }} /></>)
}
export default Input;