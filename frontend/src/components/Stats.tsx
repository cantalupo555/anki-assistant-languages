import React from 'react';
import * as S from '../styles/AppStyles';
import { TokenCount } from '../utils/Types';

interface StatsProps {
    totalTokenCount: TokenCount | null;
}

const Stats: React.FC<StatsProps> = ({ totalTokenCount }) => {
    return (
        <S.Section id="stats">
            <h2>Usage Statistics</h2>
            <S.ResultContainer>
                <h3>Token Usage</h3>
                <S.TokenInfo>
                    <h4>Total Tokens:</h4>
                    <p>
                        Input: {totalTokenCount?.inputTokens || 0}<br />
                        Output: {totalTokenCount?.outputTokens || 0}<br />
                        Total: {totalTokenCount?.totalTokens || 0}
                    </p>
                </S.TokenInfo>
                
                <h3>Historical Data</h3>
                <p>Coming soon: Charts and graphs showing usage over time</p>
            </S.ResultContainer>
        </S.Section>
    );
};

export default Stats;
