import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

export default function Status(props) {
    const { autowareState, themeMode, applyDefaultStyle } = props;
    const statusMap = new Map();
    const classMap = new Map();
    const classList = {
        blue: "blue-light",
        green: "green-light",
        orange: "orange-light",
    };
    // set status string map
    statusMap.set(1, "初始化中");
    statusMap.set(2, "等待目的地");
    statusMap.set(3, "路徑規劃中");
    statusMap.set(4, "等待發車");
    statusMap.set(5, "行駛中");
    statusMap.set(6, "抵達目的地");
    statusMap.set(7, "系統異常");
    // set status light class name map
    classMap.set(1, classList.blue);
    classMap.set(2, classList.green);
    classMap.set(3, classList.green);
    classMap.set(4, classList.green);
    classMap.set(5, classList.green);
    classMap.set(6, classList.green);
    classMap.set(7, classList.orange);
    return (
        <StatusWrapper className={`status-wrapper ${themeMode === 1 ? "dark" : "light"} ${applyDefaultStyle ? "default-style" : ""}`}>
            <span className={`status-light ${classMap.get(autowareState)}`}></span>
            <span className="status">{statusMap.get(autowareState)}</span>
        </StatusWrapper>
    );
}

Status.propTypes = {
    autowareState: PropTypes.number.isRequired,
    applyDefaultStyle: PropTypes.bool,
    themeMode: PropTypes.number, // 1:dark 2:light
};

Status.defaultProps = {
    autowareState: 0,
    applyDefaultStyle: true,
    themeMode: 1,
};

const StatusWrapper = styled.div`
    &.default-style {
        min-width: 68px;
        height: 24px;
        display: flex;
        position: relative;
        justify-content: center;
        align-items: center;
        padding: 2px 8px 2px 2px;
        border-radius: 4px;
        box-sizing: content-box;
        &.dark {
            background-color: var(--background-status-dark, #4e525c);
            .status {
                color: var(--text-status-dark, #ccd0d9);
            }
        }
        &.light {
            background-color: var(--background-status-light, #e1e4ea);
            .status {
                color: var(--text-status-light, #42454d);
            }
        }
        &::after {
            width: 2px;
            height: 18px;
            position: absolute;
            right: -10px;
            background-color: #b0bdd9;
            content: "";
        }
        .status-light {
            width: 10px;
            height: 10px;
            border-radius: 100%;
            flex-shrink: 0;
            margin: 10px;
            &.green-light {
                background-color: #00ffc2;
            }
            &.blue-light {
                background-color: #0074d9;
            }
            &.orange-light {
                background-color: #f0a40d;
            }
        }
        .status {
            font-size: 12px;
            font-weight: 500;
            font-family: "Roboto Flex";
            line-height: 28px;
            font-feature-settings: "case" on;
            white-space: nowrap;
        }
    }
`;
