pragma solidity ^0.7.3;

contract VoteShim {

    event VoteWeight(address delegatee, uint96 computedVotes);

    function sqrt96(uint96 y) internal pure returns (uint96 z) {
        if (y > 3) {
            z = y;
            uint96 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function computeVote(address srcRep, address dstRep, uint96 newVotes) external returns (uint96 computedVotes) {
        computedVotes = sqrt96(newVotes);
        emit VoteWeight(delegatee, computedVotes);
    }
}
