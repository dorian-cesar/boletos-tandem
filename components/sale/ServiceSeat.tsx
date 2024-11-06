import React from 'react'
import styled from 'styled-components'

type ServiceSitProps = {
    type: 'sinasiento' | 'pasillo' | 'libre' | 'ocupado' | 'seleccionado' | 'pet-free' | 'pet-busy' | 'pet-selected' | any,
    seatNumber?: string,
    value?: number
}

const ServiceSitImageV = {
  ['libre']: 'img/ui/seat-status/seat-available-v.svg',
  ['ocupado']: 'img/ui/seat-status/seat-unavailable-v.svg',
  ['seleccionado']: 'img/ui/seat-status/seat-selected-v.svg',
  ['pet-free']: 'img/ui/seat-status/seat-mab-available.svg',
  ['pet-busy']: 'img/ui/seat-status/seat-mab-unavailable.svg',
  ['pet-selected']: 'img/ui/seat-status/seat-mab-selected.svg',
}

const ServiceSitImageH = {
  ['libre']: 'img/ui/seat-status/seat-available-h.svg',
  ['ocupado']: 'img/ui/seat-status/seat-unavailable-h.svg',
  ['seleccionado']: 'img/ui/seat-status/seat-selected-h.svg',
  ['pet-free']: 'img/ui/seat-status/seat-mab-available.svg',
  ['pet-busy']: 'img/ui/seat-status/seat-mab-unavailable.svg',
  ['pet-selected']: 'img/ui/seat-status/seat-mab-selected.svg',
}

const colors = {
  primary: '#FF6500',
  secondary: '#3365B4',
  busy: '#9A9A9A'
}

const StyledSeat = styled.button<{ $seatStatus: string }>`
  border: none;
  background-image: url(${ props => ServiceSitImageH[props.$seatStatus] });
  height: 36px;
  width: 36px;
  background-color: transparent;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  display: flex;
  align-items: ${ props => props.$seatStatus.includes('pet') ? 'end': 'center'};
  justify-content: center;
  border: none;
  font-size: 12px;
  color: ${
    props => {
      if( props.$seatStatus.includes('seleccionado') || props.$seatStatus.includes('selected') ) {
        return colors.secondary;
      } else if ( props.$seatStatus.includes('libre') || props.$seatStatus.includes('free') ) {
        return colors.primary;
      } else if ( props.$seatStatus.includes('ocupado') || props.$seatStatus.includes('busy') ) {
        return colors.busy;
      } else {
        return '#000';
      }
    }
  };
  cursor: pointer;
  font-weight: 700;

  @media( width < 768px) {
    background-image: url(${ props => ServiceSitImageV[props.$seatStatus] });
  }
`

export default function ServiceSeat(props: ServiceSitProps) {
  return (
    <StyledSeat $seatStatus={ props.type }>
      { props.seatNumber }
    </StyledSeat>
  )
}
