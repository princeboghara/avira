"use client";

import React, { useState } from "react";
import { BinaryTreeNode } from "@/types";
import Link from "next/link";

interface BinaryGenealogyTreeProps {
  rootNode: BinaryTreeNode;
}

export default function BinaryGenealogyTree({ rootNode }: BinaryGenealogyTreeProps) {
  const [selectedNode, setSelectedNode] = useState<BinaryTreeNode | null>(rootNode);

  const handleSelect = (node: BinaryTreeNode) => {
    setSelectedNode(node);
  };

  const isSelectedRed = selectedNode ? selectedNode.personalPv < 100 : false;

  return (
    <div className="w-full space-y-6">
      {/* Quick Summary of Selected Node */}
      {selectedNode && (
        <div
          className={`rounded-2xl p-5 border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
            isSelectedRed ? "bg-red-50/40 border-red-200" : "bg-white border-emerald-200"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl text-white flex items-center justify-center font-bold text-lg shadow-md ${
                isSelectedRed
                  ? "bg-gradient-to-tr from-red-600 to-rose-400"
                  : "bg-gradient-to-tr from-[#006d36] to-[#50c878]"
              }`}
            >
              {selectedNode.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-extrabold text-base text-[#1a1c1c]">{selectedNode.fullName}</h4>
                <span className="font-mono text-xs font-bold text-[#006d36] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {selectedNode.memberId}
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isSelectedRed
                      ? "text-red-700 bg-red-100 border-red-300"
                      : "text-emerald-800 bg-emerald-100 border-emerald-300"
                  }`}
                >
                  {isSelectedRed ? "RED (<100 PV • ₹0 Cap)" : "ACTIVE (GREEN)"}
                </span>
              </div>
              <p className="text-xs text-[#5f5e5e] mt-1">
                Self PV:{" "}
                <strong className={isSelectedRed ? "text-red-600 font-bold" : "text-[#006d36]"}>
                  {selectedNode.personalPv} PV
                </strong>{" "}
                • Daily Capping Limit:{" "}
                <strong className={isSelectedRed ? "text-red-600 font-bold" : "text-[#006d36]"}>
                  ₹{selectedNode.dailyCapping.toLocaleString()} / day
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="bg-white px-4 py-2 rounded-xl border border-[#e2e2e2] text-center shadow-xs">
              <span className="text-[10px] text-[#5f5e5e] uppercase tracking-wider font-bold block">
                Left Leg Volume
              </span>
              <span className="text-base font-mono font-black text-blue-700">
                {selectedNode.leftPv.toLocaleString()} PV
              </span>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-[#e2e2e2] text-center shadow-xs">
              <span className="text-[10px] text-[#5f5e5e] uppercase tracking-wider font-bold block">
                Right Leg Volume
              </span>
              <span className="text-base font-mono font-black text-purple-700">
                {selectedNode.rightPv.toLocaleString()} PV
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Visual Binary Tree Diagram */}
      <div className="bg-[#f9f9f9] rounded-3xl p-6 sm:p-10 border border-[#e2e2e2] shadow-inner overflow-x-auto">
        <div className="min-w-[650px] flex flex-col items-center">
          {/* LEVEL 1: ROOT */}
          <div className="flex justify-center mb-6">
            <TreeNodeCard
              node={rootNode}
              isSelected={selectedNode?.id === rootNode.id}
              onSelect={handleSelect}
              leg="ROOT"
            />
          </div>

          {/* Level 1 Connection Lines */}
          <div className="w-1/2 h-6 border-t-2 border-l-2 border-r-2 border-[#006d36] mb-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#006d36]" />
          </div>

          {/* LEVEL 2 & 3: CHILDREN & GRANDCHILDREN */}
          <div className="grid grid-cols-2 gap-8 w-full max-w-3xl">
            {/* LEFT BRANCH */}
            <div className="flex flex-col items-center">
              {rootNode.leftChild ? (
                <>
                  <TreeNodeCard
                    node={rootNode.leftChild}
                    isSelected={selectedNode?.id === rootNode.leftChild.id}
                    onSelect={handleSelect}
                    leg="LEFT"
                  />

                  {/* Connection Line to Level 3 Children under Left Child */}
                  <div className="w-1/2 h-5 border-t-2 border-l-2 border-r-2 border-blue-500 my-4 relative">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-500" />
                  </div>

                  {/* Level 3 Children under Left Child */}
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="flex justify-center">
                      {rootNode.leftChild.leftChild ? (
                        <TreeNodeCard
                          node={rootNode.leftChild.leftChild}
                          isSelected={selectedNode?.id === rootNode.leftChild.leftChild.id}
                          onSelect={handleSelect}
                          leg="LEFT"
                          isSmall
                        />
                      ) : (
                        <VacantSlot
                          parentId={rootNode.leftChild.memberId}
                          position="LEFT"
                          isSmall
                        />
                      )}
                    </div>

                    <div className="flex justify-center">
                      {rootNode.leftChild.rightChild ? (
                        <TreeNodeCard
                          node={rootNode.leftChild.rightChild}
                          isSelected={selectedNode?.id === rootNode.leftChild.rightChild.id}
                          onSelect={handleSelect}
                          leg="RIGHT"
                          isSmall
                        />
                      ) : (
                        <VacantSlot
                          parentId={rootNode.leftChild.memberId}
                          position="RIGHT"
                          isSmall
                        />
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* Left is vacant: Show ONLY this slot, NO grandchildren underneath! */
                <VacantSlot parentId={rootNode.memberId} position="LEFT" />
              )}
            </div>

            {/* RIGHT BRANCH */}
            <div className="flex flex-col items-center">
              {rootNode.rightChild ? (
                <>
                  <TreeNodeCard
                    node={rootNode.rightChild}
                    isSelected={selectedNode?.id === rootNode.rightChild.id}
                    onSelect={handleSelect}
                    leg="RIGHT"
                  />

                  {/* Connection Line to Level 3 Children under Right Child */}
                  <div className="w-1/2 h-5 border-t-2 border-l-2 border-r-2 border-purple-500 my-4 relative">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-purple-500" />
                  </div>

                  {/* Level 3 Children under Right Child */}
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="flex justify-center">
                      {rootNode.rightChild.leftChild ? (
                        <TreeNodeCard
                          node={rootNode.rightChild.leftChild}
                          isSelected={selectedNode?.id === rootNode.rightChild.leftChild.id}
                          onSelect={handleSelect}
                          leg="LEFT"
                          isSmall
                        />
                      ) : (
                        <VacantSlot
                          parentId={rootNode.rightChild.memberId}
                          position="LEFT"
                          isSmall
                        />
                      )}
                    </div>

                    <div className="flex justify-center">
                      {rootNode.rightChild.rightChild ? (
                        <TreeNodeCard
                          node={rootNode.rightChild.rightChild}
                          isSelected={selectedNode?.id === rootNode.rightChild.rightChild.id}
                          onSelect={handleSelect}
                          leg="RIGHT"
                          isSmall
                        />
                      ) : (
                        <VacantSlot
                          parentId={rootNode.rightChild.memberId}
                          position="RIGHT"
                          isSmall
                        />
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* Right is vacant: Show ONLY this slot, NO grandchildren underneath! */
                <VacantSlot parentId={rootNode.memberId} position="RIGHT" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TreeNodeCard({
  node,
  isSelected,
  onSelect,
  leg,
  isSmall = false,
}: {
  node: BinaryTreeNode;
  isSelected: boolean;
  onSelect: (node: BinaryTreeNode) => void;
  leg: string;
  isSmall?: boolean;
}) {
  const isRed = node.personalPv < 100;

  return (
    <button
      type="button"
      onClick={() => onSelect(node)}
      className={`text-left transition-all duration-200 rounded-2xl p-3 border cursor-pointer ${
        isSmall ? "w-36 text-[10px]" : "w-52 text-xs"
      } ${
        isSelected
          ? isRed
            ? "bg-white border-red-500 shadow-lg ring-2 ring-red-400"
            : "bg-white border-[#006d36] shadow-lg ring-2 ring-[#006d36]"
          : isRed
          ? "bg-red-50/50 border-red-300 hover:border-red-400 shadow-sm"
          : "bg-white border-[#e2e2e2] shadow-sm hover:border-[#50c878] hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={`font-mono font-extrabold ${
            isSmall ? "text-[10px]" : "text-xs"
          } ${isRed ? "text-red-700" : "text-[#006d36]"}`}
        >
          {node.memberId}
        </span>
        <div className="flex items-center gap-1">
          <span
            className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
              isRed
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
            }`}
          >
            {isRed ? "RED" : "ACTIVE"}
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
              leg === "LEFT"
                ? "bg-blue-50 text-blue-700"
                : leg === "RIGHT"
                ? "bg-purple-50 text-purple-700"
                : "bg-emerald-50 text-emerald-800"
            }`}
          >
            {leg}
          </span>
        </div>
      </div>

      <div className="font-bold text-[#1a1c1c] truncate mb-1">{node.fullName}</div>

      <div className="flex items-center justify-between text-[9px] text-[#5f5e5e] pt-1 border-t border-[#e2e2e2]/60">
        <span className={isRed ? "text-red-600 font-semibold" : ""}>Self: {node.personalPv} PV</span>
        <span className={`font-bold ${isRed ? "text-red-600" : "text-[#006d36]"}`}>
          Cap: ₹{node.dailyCapping.toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1 mt-1.5 text-center font-mono font-bold text-[9px]">
        <div className="bg-[#f0f3ff] rounded py-0.5 text-blue-700">L: {node.leftPv}</div>
        <div className="bg-[#f5f0ff] rounded py-0.5 text-purple-700">R: {node.rightPv}</div>
      </div>
    </button>
  );
}

function VacantSlot({
  parentId,
  position,
  isSmall = false,
}: {
  parentId: string;
  position: "LEFT" | "RIGHT";
  isSmall?: boolean;
}) {
  return (
    <Link
      href={`/register?ref=${parentId}&pos=${position}`}
      className={`border-2 border-dashed border-[#bdcabc] rounded-2xl flex flex-col items-center justify-center p-3 text-[#5f5e5e] hover:border-[#006d36] hover:text-[#006d36] hover:bg-emerald-50/50 transition-all ${
        isSmall ? "w-36 h-24 text-[10px]" : "w-52 h-28 text-xs"
      }`}
    >
      <span className="material-symbols-outlined text-[20px] mb-1">person_add</span>
      <span className="font-bold text-[11px]">+ Add Member</span>
      <span className="text-[9px] font-mono text-[#5f5e5e]/70">{position} Leg</span>
    </Link>
  );
}
