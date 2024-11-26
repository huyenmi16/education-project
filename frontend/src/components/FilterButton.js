import React from "react";
import { Button, Dropdown, Menu } from 'antd';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from '@fortawesome/free-solid-svg-icons';
const filterItem =(
    <Menu>
        <Menu.Item key="1">Mới nhất</Menu.Item>
        <Menu.Item key="2">Cũ Nhất</Menu.Item>
        <Menu.Item key="3">A-Z</Menu.Item>
    </Menu>
);

const FilterButton = () =>(
    <Dropdown overlay={filterItem} trigger={['click']}>
        <Button>
            <FontAwesomeIcon icon={faFilter}/>
        </Button>
    </Dropdown>
)

export default FilterButton;